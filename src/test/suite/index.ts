import * as path from "path"
import Mocha from "mocha"
import { glob } from "glob"
import { ClineAPI } from "../../exports/cline"
import { ClineProvider } from "../../core/webview/ClineProvider"
import * as vscode from "vscode"

declare global {
	var api: ClineAPI
	var provider: ClineProvider
	var extension: vscode.Extension<ClineAPI> | undefined
	var panel: vscode.WebviewPanel | undefined
}

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: "tdd",
		timeout: 600000, // 10 minutes to compensate for time communicating with LLM while running in GHA
	})

	const testsRoot = path.resolve(__dirname, "..")

	try {
		// Find all test files
		const files = await glob("**/**.test.js", { cwd: testsRoot })

		// Add files to the test suite
		files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

		//Set up global extension, api, provider, and panel
<<<<<<< HEAD
		globalThis.extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")
=======
		globalThis.extension = vscode.extensions.getExtension("Hans.optima-ai")
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
		if (!globalThis.extension) {
			throw new Error("Extension not found")
		}

		globalThis.api = globalThis.extension.isActive
			? globalThis.extension.exports
			: await globalThis.extension.activate()
		globalThis.provider = globalThis.api.sidebarProvider
		await globalThis.provider.updateGlobalState("apiProvider", "openrouter")
		await globalThis.provider.updateGlobalState("openRouterModelId", "anthropic/claude-3.5-sonnet")
		await globalThis.provider.storeSecret(
			"openRouterApiKey",
			process.env.OPENROUTER_API_KEY || "sk-or-v1-fake-api-key",
		)

		globalThis.panel = vscode.window.createWebviewPanel(
<<<<<<< HEAD
			"roo-cline.SidebarProvider",
			"Roo Code",
=======
			"optima-ai.SidebarProvider",
			"Optima AI",
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				enableCommandUris: true,
				retainContextWhenHidden: true,
				localResourceRoots: [globalThis.extension?.extensionUri],
			},
		)

		await globalThis.provider.resolveWebviewView(globalThis.panel)

		let startTime = Date.now()
		const timeout = 60000
		const interval = 1000

		while (Date.now() - startTime < timeout) {
			if (globalThis.provider.viewLaunched) {
				break
			}

			await new Promise((resolve) => setTimeout(resolve, interval))
		}

		// Run the mocha test
		return new Promise((resolve, reject) => {
			try {
				mocha.run((failures: number) => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`))
					} else {
						resolve()
					}
				})
			} catch (err) {
				console.error(err)
				reject(err)
			}
		})
	} catch (err) {
		console.error("Error while running tests:")
		console.error(err)
		throw err
	}
}
