import { EventEmitter } from "events";
import stripAnsi from "strip-ansi";
// how long to wait after a process outputs anything before we consider it "cool" again
const PROCESS_HOT_TIMEOUT_NORMAL = 2_000;
const PROCESS_HOT_TIMEOUT_COMPILING = 15_000;
export class TerminalProcess extends EventEmitter {
    waitForShellIntegration = true;
    isListening = true;
    buffer = "";
    fullOutput = "";
    lastRetrievedIndex = 0;
    isHot = false;
    hotTimer = null;
    // constructor() {
    // 	super()
    async run(terminal, command) {
        if (terminal.shellIntegration && terminal.shellIntegration.executeCommand) {
            const execution = terminal.shellIntegration.executeCommand(command);
            const stream = execution.read();
            // todo: need to handle errors
            let isFirstChunk = true;
            let didOutputNonCommand = false;
            let didEmitEmptyLine = false;
            for await (let data of stream) {
                // 1. Process chunk and remove artifacts
                if (isFirstChunk) {
                    /*
                    The first chunk we get from this stream needs to be processed to be more human readable, ie remove vscode's custom escape sequences and identifiers, removing duplicate first char bug, etc.
                    */
                    // bug where sometimes the command output makes its way into vscode shell integration metadata
                    /*
                    ]633 is a custom sequence number used by VSCode shell integration:
                    - OSC 633 ; A ST - Mark prompt start
                    - OSC 633 ; B ST - Mark prompt end
                    - OSC 633 ; C ST - Mark pre-execution (start of command output)
                    - OSC 633 ; D [; <exitcode>] ST - Mark execution finished with optional exit code
                    - OSC 633 ; E ; <commandline> [; <nonce>] ST - Explicitly set command line with optional nonce
                    */
                    // if you print this data you might see something like "eecho hello worldo hello world;5ba85d14-e92a-40c4-b2fd-71525581eeb0]633;C" but this is actually just a bunch of escape sequences, ignore up to the first ;C
                    /* ddateb15026-6a64-40db-b21f-2a621a9830f0]633;CTue Sep 17 06:37:04 EDT 2024 % ]633;D;0]633;P;Cwd=/Users/saoud/Repositories/test */
                    // Gets output between ]633;C (command start) and ]633;D (command end)
                    const outputBetweenSequences = this.removeLastLineArtifacts(data.match(/\]633;C([\s\S]*?)\]633;D/)?.[1] || "").trim();
                    // Once we've retrieved any potential output between sequences, we can remove everything up to end of the last sequence
                    // https://code.visualstudio.com/docs/terminal/shell-integration#_vs-code-custom-sequences-osc-633-st
                    const vscodeSequenceRegex = /\x1b\]633;.[^\x07]*\x07/g;
                    const lastMatch = [...data.matchAll(vscodeSequenceRegex)].pop();
                    if (lastMatch && lastMatch.index !== undefined) {
                        data = data.slice(lastMatch.index + lastMatch[0].length);
                    }
                    // Place output back after removing vscode sequences
                    if (outputBetweenSequences) {
                        data = outputBetweenSequences + "\n" + data;
                    }
                    // remove ansi
                    data = stripAnsi(data);
                    // Split data by newlines
                    let lines = data ? data.split(/\r?\n/) : [];
                    // Remove non-human readable characters from the first line
                    if (lines.length > 0) {
                        lines[0] = lines[0].replace(/[^\x20-\x7E]/g, "");
                    }
                    // Check if first two characters are the same, if so remove the first character
                    if (lines.length > 0 && lines[0].length >= 2 && lines[0][0] === lines[0][1]) {
                        lines[0] = lines[0].slice(1);
                    }
                    // Remove everything up to the first alphanumeric character for first two lines
                    if (lines.length > 0) {
                        lines[0] = lines[0].replace(/^[^a-zA-Z0-9]*/, "");
                    }
                    if (lines.length > 1) {
                        lines[1] = lines[1].replace(/^[^a-zA-Z0-9]*/, "");
                    }
                    // Join lines back
                    data = lines.join("\n");
                    isFirstChunk = false;
                }
                else {
                    data = stripAnsi(data);
                }
                // first few chunks could be the command being echoed back, so we must ignore
                // note this means that 'echo' commands wont work
                if (!didOutputNonCommand) {
                    const lines = data.split(/\r?\n/);
                    for (let i = 0; i < lines.length; i++) {
                        if (command.includes(lines[i].trim())) {
                            lines.splice(i, 1);
                            i--; // Adjust index after removal
                        }
                        else {
                            didOutputNonCommand = true;
                            break;
                        }
                    }
                    data = lines.join("\n");
                }
                // Windows-specific fix: ensure CRLF is properly handled 
                if (process.platform === "win32") {
                    // Replace Windows CRLF with just LF for consistent processing
                    data = data.replace(/\r\n/g, "\n");
                }
                // FIXME: right now it seems that data chunks returned to us from the shell integration stream contains random commas, which from what I can tell is not the expected behavior. There has to be a better solution here than just removing all commas.
                data = data.replace(/,/g, "");
                // 2. Set isHot depending on the command
                // Set to hot to stall API requests until terminal is cool again
                this.isHot = true;
                if (this.hotTimer) {
                    clearTimeout(this.hotTimer);
                }
                // these markers indicate the command is some kind of local dev server recompiling the app, which we want to wait for output of before sending request to cline
                const compilingMarkers = ["compiling", "building", "bundling", "transpiling", "generating", "starting"];
                const markerNullifiers = [
                    "compiled",
                    "success",
                    "finish",
                    "complete",
                    "succeed",
                    "done",
                    "end",
                    "stop",
                    "exit",
                    "terminate",
                    "error",
                    "fail",
                ];
                const isCompiling = compilingMarkers.some((marker) => data.toLowerCase().includes(marker.toLowerCase())) &&
                    !markerNullifiers.some((nullifier) => data.toLowerCase().includes(nullifier.toLowerCase()));
                this.hotTimer = setTimeout(() => {
                    this.isHot = false;
                }, isCompiling ? PROCESS_HOT_TIMEOUT_COMPILING : PROCESS_HOT_TIMEOUT_NORMAL);
                // For non-immediately returning commands we want to show loading spinner right away but this wouldnt happen until it emits a line break, so as soon as we get any output we emit "" to let webview know to show spinner
                if (!didEmitEmptyLine && !this.fullOutput && data) {
                    this.emit("line", ""); // empty line to indicate start of command output stream
                    didEmitEmptyLine = true;
                }
                this.fullOutput += data;
                if (this.isListening) {
                    this.emitIfEol(data);
                    this.lastRetrievedIndex = this.fullOutput.length - this.buffer.length;
                }
            }
            this.emitRemainingBufferIfListening();
            // for now we don't want this delaying requests since we don't send diagnostics automatically anymore (previous: "even though the command is finished, we still want to consider it 'hot' in case so that api request stalls to let diagnostics catch up")
            if (this.hotTimer) {
                clearTimeout(this.hotTimer);
            }
            this.isHot = false;
            this.emit("completed");
            this.emit("continue");
        }
        else {
            terminal.sendText(command, true);
            // For terminals without shell integration, we can't know when the command completes
            // On Windows, we need a special handling for terminal output retrieval
            if (process.platform === "win32") {
                // On Windows, try to capture output through alternative means
                this.emit("line", ""); // Initial empty line to show activity
                // Try to get terminal output on Windows using writeEmitter if available
                try {
                    // @ts-ignore - Access writeEmitter which might be private but available
                    const writeEmitter = terminal._writeEmitter;
                    if (writeEmitter) {
                        const outputHandler = (data) => {
                            if (data) {
                                this.fullOutput += data;
                                this.emitIfEol(data);
                            }
                        };
                        writeEmitter.event(outputHandler);
                        // Set a timeout to handle command completion
                        setTimeout(() => {
                            this.emitRemainingBufferIfListening();
                            // Clean up event listener
                            // @ts-ignore - Accessing private API
                            writeEmitter.dispose && writeEmitter.dispose();
                            this.emit("completed");
                            this.emit("continue");
                        }, 2000);
                        return;
                    }
                }
                catch (err) {
                    console.error("Failed to access terminal write emitter:", err);
                }
                // Fallback if writeEmitter approach doesn't work
                this.fullOutput = "Command executed. Limited terminal output capability on Windows without shell integration.";
                this.emit("line", "Command executed. Limited terminal output capability on Windows without shell integration.");
                this.emit("line", "To enable full output capture, consider using shell integration.");
                setTimeout(() => {
                    this.emit("completed");
                    this.emit("continue");
                }, 300);
            }
            else {
                // Default behavior for other platforms
                this.emit("completed");
                this.emit("continue");
                this.emit("no_shell_integration");
            }
        }
    }
    // Inspired by https://github.com/sindresorhus/execa/blob/main/lib/transform/split.js
    emitIfEol(chunk) {
        this.buffer += chunk;
        let lineEndIndex;
        // Updated regex to handle both Windows CRLF and Unix LF consistently
        const lineEndingRegex = /\r?\n/;
        while ((lineEndIndex = this.buffer.search(lineEndingRegex)) !== -1) {
            // Get the line ending that was matched
            const match = this.buffer.match(lineEndingRegex);
            const lineEnding = match ? match[0] : '\n';
            let line = this.buffer.slice(0, lineEndIndex).trimEnd();
            this.emit("line", line);
            // Skip over the line ending (either \r\n or \n)
            this.buffer = this.buffer.slice(lineEndIndex + lineEnding.length);
        }
    }
    emitRemainingBufferIfListening() {
        if (this.buffer && this.isListening) {
            const remainingBuffer = this.removeLastLineArtifacts(this.buffer);
            if (remainingBuffer) {
                this.emit("line", remainingBuffer);
            }
            this.buffer = "";
            this.lastRetrievedIndex = this.fullOutput.length;
        }
    }
    continue() {
        this.emitRemainingBufferIfListening();
        this.isListening = false;
        this.removeAllListeners("line");
        this.emit("continue");
    }
    getUnretrievedOutput() {
        const unretrieved = this.fullOutput.slice(this.lastRetrievedIndex);
        this.lastRetrievedIndex = this.fullOutput.length;
        return this.removeLastLineArtifacts(unretrieved);
    }
    // some processing to remove artifacts like '%' at the end of the buffer (it seems that since vsode uses % at the beginning of newlines in terminal, it makes its way into the stream)
    // This modification will remove '%', '$', '#', or '>' followed by optional whitespace
    removeLastLineArtifacts(output) {
        const lines = output.trimEnd().split("\n");
        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1];
            // Remove prompt characters and trailing whitespace from the last line
            lines[lines.length - 1] = lastLine.replace(/[%$#>]\s*$/, "");
        }
        return lines.join("\n").trimEnd();
    }
}
// Similar to execa's ResultPromise, this lets us create a mixin of both a TerminalProcess and a Promise: https://github.com/sindresorhus/execa/blob/main/lib/methods/promise.js
export function mergePromise(process, promise) {
    const nativePromisePrototype = (async () => { })().constructor.prototype;
    const descriptors = ["then", "catch", "finally"].map((property) => [property, Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)]);
    for (const [property, descriptor] of descriptors) {
        if (descriptor) {
            const value = descriptor.value.bind(promise);
            Reflect.defineProperty(process, property, { ...descriptor, value });
        }
    }
    return process;
}
//# sourceMappingURL=TerminalProcess.js.map