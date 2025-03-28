import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS } from "./tool-groups";
// Helper to extract group name regardless of format
export function getGroupName(group) {
    return Array.isArray(group) ? group[0] : group;
}
// Helper to get group options if they exist
function getGroupOptions(group) {
    return Array.isArray(group) ? group[1] : undefined;
}
// Helper to check if a file path matches a regex pattern
export function doesFileMatchRegex(filePath, pattern) {
    try {
        const regex = new RegExp(pattern);
        return regex.test(filePath);
    }
    catch (error) {
        console.error(`Invalid regex pattern: ${pattern}`, error);
        return false;
    }
}
// Helper to get all tools for a mode
export function getToolsForMode(groups) {
    const tools = new Set();
    // Add tools from each group
    groups.forEach((group) => {
        const groupName = getGroupName(group);
        const groupConfig = TOOL_GROUPS[groupName];
        groupConfig.tools.forEach((tool) => tools.add(tool));
    });
    // Always add required tools
    ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool));
    return Array.from(tools);
}
// Main modes configuration as an ordered array
export const modes = [
    {
        slug: "code",
        name: "Code",
        roleDefinition: "You are Optima AI, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
        groups: ["read", "edit", "browser", "command", "mcp", "web"],
    },
    {
        slug: "architect",
        name: "Architect",
        roleDefinition: "You are Optima AI, an experienced technical leader who is inquisitive and an excellent planner. Your goal is to gather information and get context to create a detailed plan for accomplishing the user's task, which the user will review and approve before they switch into another mode to implement the solution.",
        groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp", "web"],
        customInstructions: "Depending on the user's request, you may need to do some information gathering (for example using read_file or search_files) to get more context about the task. You may also ask the user clarifying questions to get a better understanding of the task. Once you've gained more context about the user's request, you should create a detailed plan for how to accomplish the task. (You can write the plan to a markdown file if it seems appropriate.)\n\nThen you might ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and plan the best way to accomplish it. Finally once it seems like you've reached a good plan, use the switch_mode tool to request that the user switch to another mode to implement the solution.",
    },
    {
        slug: "ask",
        name: "Ask",
        roleDefinition: "You are Optima AI, a knowledgeable technical assistant focused on answering questions and providing information about software development, technology, and related topics.",
        groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp", "web"],
        customInstructions: "You can analyze code, explain concepts, and access external resources. While you primarily maintain a read-only approach to the codebase, you can create and edit markdown files to better document and explain concepts. Make sure to answer the user's questions and don't rush to switch to implementing code.",
    },
];
// Export the default mode slug
export const defaultModeSlug = modes[0].slug;
// Helper functions
export function getModeBySlug(slug, customModes) {
    // Check custom modes first
    const customMode = customModes?.find((mode) => mode.slug === slug);
    if (customMode) {
        return customMode;
    }
    // Then check built-in modes
    return modes.find((mode) => mode.slug === slug);
}
export function getModeConfig(slug, customModes) {
    const mode = getModeBySlug(slug, customModes);
    if (!mode) {
        throw new Error(`No mode found for slug: ${slug}`);
    }
    return mode;
}
// Get all available modes, with custom modes overriding built-in modes
export function getAllModes(customModes) {
    if (!customModes?.length) {
        return [...modes];
    }
    // Start with built-in modes
    const allModes = [...modes];
    // Process custom modes
    customModes.forEach((customMode) => {
        const index = allModes.findIndex((mode) => mode.slug === customMode.slug);
        if (index !== -1) {
            // Override existing mode
            allModes[index] = customMode;
        }
        else {
            // Add new mode
            allModes.push(customMode);
        }
    });
    return allModes;
}
// Check if a mode is custom or an override
export function isCustomMode(slug, customModes) {
    return !!customModes?.some((mode) => mode.slug === slug);
}
// Custom error class for file restrictions
export class FileRestrictionError extends Error {
    constructor(mode, pattern, description, filePath) {
        super(`This mode (${mode}) can only edit files matching pattern: ${pattern}${description ? ` (${description})` : ""}. Got: ${filePath}`);
        this.name = "FileRestrictionError";
    }
}
export function isToolAllowedForMode(tool, modeSlug, customModes, toolRequirements, toolParams, // All tool parameters
experiments) {
    // Always allow these tools
    if (ALWAYS_AVAILABLE_TOOLS.includes(tool)) {
        return true;
    }
    if (experiments && tool in experiments) {
        if (!experiments[tool]) {
            return false;
        }
    }
    // Check tool requirements if any exist
    if (toolRequirements && tool in toolRequirements) {
        if (!toolRequirements[tool]) {
            return false;
        }
    }
    const mode = getModeBySlug(modeSlug, customModes);
    if (!mode) {
        return false;
    }
    // Check if tool is in any of the mode's groups and respects any group options
    for (const group of mode.groups) {
        const groupName = getGroupName(group);
        const options = getGroupOptions(group);
        const groupConfig = TOOL_GROUPS[groupName];
        // If the tool isn't in this group's tools, continue to next group
        if (!groupConfig.tools.includes(tool)) {
            continue;
        }
        // If there are no options, allow the tool
        if (!options) {
            return true;
        }
        // For the edit group, check file regex if specified
        if (groupName === "edit" && options.fileRegex) {
            const filePath = toolParams?.path;
            if (filePath &&
                (toolParams.diff || toolParams.content || toolParams.operations) &&
                !doesFileMatchRegex(filePath, options.fileRegex)) {
                throw new FileRestrictionError(mode.name, options.fileRegex, options.description, filePath);
            }
        }
        return true;
    }
    return false;
}
// Create the mode-specific default prompts
export const defaultPrompts = Object.freeze(Object.fromEntries(modes.map((mode) => [
    mode.slug,
    {
        roleDefinition: mode.roleDefinition,
        customInstructions: mode.customInstructions,
    },
])));
// Helper function to safely get role definition
export function getRoleDefinition(modeSlug, customModes) {
    const mode = getModeBySlug(modeSlug, customModes);
    if (!mode) {
        console.warn(`No mode found for slug: ${modeSlug}`);
        return "";
    }
    return mode.roleDefinition;
}
// Helper function to safely get custom instructions
export function getCustomInstructions(modeSlug, customModes) {
    const mode = getModeBySlug(modeSlug, customModes);
    if (!mode) {
        console.warn(`No mode found for slug: ${modeSlug}`);
        return "";
    }
    return mode.customInstructions ?? "";
}
//# sourceMappingURL=modes.js.map