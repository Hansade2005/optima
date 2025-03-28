import { Anthropic } from "@anthropic-ai/sdk"
import { MessageContent } from "../../shared/api"
import { ConversationRole, Message, ContentBlock } from "@aws-sdk/client-bedrock-runtime"
<<<<<<< HEAD
=======
// Import types from centralized stubs file
import { TextBlock, Usage } from "../stubs"
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856

// Import StreamEvent type from bedrock.ts
import { StreamEvent } from "../providers/bedrock"

/**
 * Convert Anthropic messages to Bedrock Converse format
 */
export function convertToBedrockConverseMessages(anthropicMessages: Anthropic.Messages.MessageParam[]): Message[] {
	return anthropicMessages.map((anthropicMessage) => {
		// Map Anthropic roles to Bedrock roles
		const role: ConversationRole = anthropicMessage.role === "assistant" ? "assistant" : "user"

		if (typeof anthropicMessage.content === "string") {
<<<<<<< HEAD
			return {
				role,
				content: [
					{
						text: anthropicMessage.content,
					},
				] as ContentBlock[],
=======
			const textBlock: TextBlock = {
				type: "text",
				text: anthropicMessage.content,
				citations: []
			}

			const usage: Usage = {
				input_tokens: 0,
				output_tokens: 0,
				cache_creation_input_tokens: 0,
				cache_read_input_tokens: 0
			}

			return {
				role,
				content: [textBlock],
				usage: usage,
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
			}
		}

		// Process complex content types
		const content = anthropicMessage.content.map((block) => {
			const messageBlock = block as MessageContent & {
				id?: string
				tool_use_id?: string
				content?: Array<{ type: string; text: string }>
				output?: string | Array<{ type: string; text: string }>
			}

			if (messageBlock.type === "text") {
<<<<<<< HEAD
				return {
					text: messageBlock.text || "",
				} as ContentBlock
=======
				const textBlock: TextBlock = {
					type: "text",
					text: messageBlock.text || "",
					citations: []
				}

				return textBlock
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
			}

			if (messageBlock.type === "image" && messageBlock.source) {
				// Convert base64 string to byte array if needed
				let byteArray: Uint8Array
				if (typeof messageBlock.source.data === "string") {
					const binaryString = atob(messageBlock.source.data)
					byteArray = new Uint8Array(binaryString.length)
					for (let i = 0; i < binaryString.length; i++) {
						byteArray[i] = binaryString.charCodeAt(i)
					}
				} else {
					byteArray = messageBlock.source.data
				}

				// Extract format from media_type (e.g., "image/jpeg" -> "jpeg")
				const format = messageBlock.source.media_type.split("/")[1]
				if (!["png", "jpeg", "gif", "webp"].includes(format)) {
					throw new Error(`Unsupported image format: ${format}`)
				}

				return {
					image: {
						format: format as "png" | "jpeg" | "gif" | "webp",
						source: {
							bytes: byteArray,
						},
					},
				} as ContentBlock
			}

			if (messageBlock.type === "tool_use") {
				// Convert tool use to XML format
				const toolParams = Object.entries(messageBlock.input || {})
					.map(([key, value]) => `<${key}>\n${value}\n</${key}>`)
					.join("\n")

				return {
					toolUse: {
						toolUseId: messageBlock.id || "",
						name: messageBlock.name || "",
						input: `<${messageBlock.name}>\n${toolParams}\n</${messageBlock.name}>`,
					},
				} as ContentBlock
			}

			if (messageBlock.type === "tool_result") {
				// First try to use content if available
				if (messageBlock.content && Array.isArray(messageBlock.content)) {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: messageBlock.content.map((item) => ({
								text: item.text,
							})),
							status: "success",
						},
					} as ContentBlock
				}

				// Fall back to output handling if content is not available
				if (messageBlock.output && typeof messageBlock.output === "string") {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: [
								{
									text: messageBlock.output,
								},
							],
							status: "success",
						},
					} as ContentBlock
				}
				// Handle array of content blocks if output is an array
				if (Array.isArray(messageBlock.output)) {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: messageBlock.output.map((part) => {
								if (typeof part === "object" && "text" in part) {
									return { text: part.text }
								}
								// Skip images in tool results as they're handled separately
								if (typeof part === "object" && "type" in part && part.type === "image") {
									return { text: "(see following message for image)" }
								}
								return { text: String(part) }
							}),
							status: "success",
						},
					} as ContentBlock
				}

				// Default case
				return {
					toolResult: {
						toolUseId: messageBlock.tool_use_id || "",
						content: [
							{
								text: String(messageBlock.output || ""),
							},
						],
						status: "success",
					},
				} as ContentBlock
			}

			if (messageBlock.type === "video") {
				const videoContent = messageBlock.s3Location
					? {
							s3Location: {
								uri: messageBlock.s3Location.uri,
								bucketOwner: messageBlock.s3Location.bucketOwner,
							},
						}
					: messageBlock.source

				return {
					video: {
						format: "mp4", // Default to mp4, adjust based on actual format if needed
						source: videoContent,
					},
				} as ContentBlock
			}

			// Default case for unknown block types
			return {
				text: "[Unknown Block Type]",
			} as ContentBlock
		})

		return {
			role,
			content,
		}
	})
}

/**
 * Convert Bedrock Converse stream events to Anthropic message format
 */
export function convertToAnthropicMessage(
	streamEvent: StreamEvent,
	modelId: string,
): Partial<Anthropic.Messages.Message> {
	// Handle metadata events
	if (streamEvent.metadata?.usage) {
		return {
			id: "", // Bedrock doesn't provide message IDs
			type: "message",
			role: "assistant",
			model: modelId,
			usage: {
				input_tokens: streamEvent.metadata.usage.inputTokens || 0,
				output_tokens: streamEvent.metadata.usage.outputTokens || 0,
<<<<<<< HEAD
			},
=======
				cache_creation_input_tokens: 0,
				cache_read_input_tokens: 0
			},
			content: [{
				type: "text",
				text: streamEvent.contentBlockStart?.start?.text || streamEvent.contentBlockDelta?.delta?.text || "",
				citations: []
			}],
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
		}
	}

	// Handle content blocks
	const text = streamEvent.contentBlockStart?.start?.text || streamEvent.contentBlockDelta?.delta?.text
	if (text !== undefined) {
<<<<<<< HEAD
		return {
			type: "message",
			role: "assistant",
			content: [{ type: "text", text: text }],
=======
		const textBlock: TextBlock = {
			type: "text",
			text: text,
			citations: []
		}

		const usage: Usage = {
			input_tokens: 0,
			output_tokens: 0,
			cache_creation_input_tokens: 0,
			cache_read_input_tokens: 0
		}

		return {
			type: "message",
			role: "assistant",
			content: [textBlock],
			usage: usage,
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
			model: modelId,
		}
	}

	// Handle message stop
	if (streamEvent.messageStop) {
		return {
			type: "message",
			role: "assistant",
			stop_reason: streamEvent.messageStop.stopReason || null,
			stop_sequence: null,
			model: modelId,
		}
	}

	return {}
}
<<<<<<< HEAD
=======

// Export stubs for other modules that might use these
export { TextBlock, Usage }
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
