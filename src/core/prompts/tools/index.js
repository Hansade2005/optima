import { getExecuteCommandDescription } from "./execute-command";
import { getReadFileDescription } from "./read-file";
import { getWriteToFileDescription } from "./write-to-file";
import { getSearchFilesDescription } from "./search-files";
import { getListFilesDescription } from "./list-files";
import { getInsertContentDescription } from "./insert-content";
import { getSearchAndReplaceDescription } from "./search-and-replace";
import { getListCodeDefinitionNamesDescription } from "./list-code-definition-names";
import { getBrowserActionDescription } from "./browser-action";
import { getAskFollowupQuestionDescription } from "./ask-followup-question";
import { getAttemptCompletionDescription } from "./attempt-completion";
import { getUseMcpToolDescription } from "./use-mcp-tool";
import { getAccessMcpResourceDescription } from "./access-mcp-resource";
import { getSwitchModeDescription } from "./switch-mode";
import { getNewTaskDescription } from "./new-task";
import { getWebSearchDescription } from "./web-search";
import { getModeConfig, isToolAllowedForMode, getGroupName } from "../../../shared/modes";
import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS } from "../../../shared/tool-groups";
// Map of tool names to their description functions
const toolDescriptionMap = {
    execute_command: (args) => getExecuteCommandDescription(args),
    read_file: (args) => getReadFileDescription(args),
    write_to_file: (args) => getWriteToFileDescription(args),
    search_files: (args) => getSearchFilesDescription(args),
    list_files: (args) => getListFilesDescription(args),
    list_code_definition_names: (args) => getListCodeDefinitionNamesDescription(args),
    browser_action: (args) => getBrowserActionDescription(args),
    ask_followup_question: () => getAskFollowupQuestionDescription(),
    attempt_completion: () => getAttemptCompletionDescription(),
    use_mcp_tool: (args) => getUseMcpToolDescription(args),
    access_mcp_resource: (args) => getAccessMcpResourceDescription(args),
    switch_mode: () => getSwitchModeDescription(),
    new_task: (args) => getNewTaskDescription(args),
    insert_content: (args) => getInsertContentDescription(args),
    search_and_replace: (args) => getSearchAndReplaceDescription(args),
    web_search: () => getWebSearchDescription(),
    apply_diff: (args) => args.diffStrategy ? args.diffStrategy.getToolDescription({ cwd: args.cwd, toolOptions: args.toolOptions }) : "",
};
export function getToolDescriptionsForMode(mode, cwd, supportsComputerUse, diffStrategy, browserViewportSize, mcpHub, customModes, experiments) {
    const config = getModeConfig(mode, customModes);
    const args = {
        cwd,
        supportsComputerUse,
        diffStrategy,
        browserViewportSize,
        mcpHub,
    };
    const tools = new Set();
    // Add tools from mode's groups
    config.groups.forEach((groupEntry) => {
        const groupName = getGroupName(groupEntry);
        const toolGroup = TOOL_GROUPS[groupName];
        if (toolGroup) {
            toolGroup.tools.forEach((tool) => {
                if (isToolAllowedForMode(tool, mode, customModes ?? [], experiments ?? {})) {
                    tools.add(tool);
                }
            });
        }
    });
    // Add always available tools
    ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool));
    // Map tool descriptions for allowed tools
    const descriptions = Array.from(tools).map((toolName) => {
        const descriptionFn = toolDescriptionMap[toolName];
        if (!descriptionFn) {
            return undefined;
        }
        return descriptionFn({
            ...args,
            toolOptions: undefined, // No tool options in group-based approach
        });
    });
    return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`;
}
// Export individual description functions for backward compatibility
export { getExecuteCommandDescription, getReadFileDescription, getWriteToFileDescription, getSearchFilesDescription, getListFilesDescription, getListCodeDefinitionNamesDescription, getBrowserActionDescription, getAskFollowupQuestionDescription, getAttemptCompletionDescription, getUseMcpToolDescription, getAccessMcpResourceDescription, getSwitchModeDescription, getInsertContentDescription, getSearchAndReplaceDescription, getWebSearchDescription, };
//# sourceMappingURL=index.js.map