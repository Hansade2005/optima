import * as vscode from "vscode"

export type ApiProvider =
	| "anthropic"
	| "glama"
	| "openrouter"
	| "bedrock"
	| "vertex"
	| "openai"
	| "ollama"
	| "lmstudio"
	| "gemini"
	| "openai-native"
	| "deepseek"
	| "vscode-lm"
	| "mistral"
	| "unbound"
	| "requesty"
<<<<<<< HEAD
	| "optima"
=======
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856

export interface ApiHandlerOptions {
	apiModelId?: string
	apiKey?: string // anthropic
	anthropicBaseUrl?: string
	vsCodeLmModelSelector?: vscode.LanguageModelChatSelector
	glamaModelId?: string
	glamaModelInfo?: ModelInfo
	glamaApiKey?: string
	openRouterApiKey?: string
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo
	openRouterBaseUrl?: string
	awsAccessKey?: string
	awsSecretKey?: string
	awsSessionToken?: string
	awsRegion?: string
	awsUseCrossRegionInference?: boolean
	awsUsePromptCache?: boolean
	awspromptCacheId?: string
	awsProfile?: string
	awsUseProfile?: boolean
	vertexProjectId?: string
	vertexRegion?: string
	openAiBaseUrl?: string
	openAiApiKey?: string
	openAiModelId?: string
	openAiCustomModelInfo?: ModelInfo
	openAiUseAzure?: boolean
	ollamaModelId?: string
	ollamaBaseUrl?: string
	lmStudioModelId?: string
	lmStudioBaseUrl?: string
	geminiApiKey?: string
	openAiNativeApiKey?: string
	mistralApiKey?: string
	azureApiVersion?: string
	openRouterUseMiddleOutTransform?: boolean
	openAiStreamingEnabled?: boolean
	setAzureApiVersion?: boolean
	deepSeekBaseUrl?: string
	deepSeekApiKey?: string
	includeMaxTokens?: boolean
	unboundApiKey?: string
	unboundModelId?: string
	unboundModelInfo?: ModelInfo
	requestyApiKey?: string
	requestyModelId?: string
	requestyModelInfo?: ModelInfo
	modelTemperature?: number
<<<<<<< HEAD
	// Model hosting and deployment
	localModelConfig?: {
		modelPath: string
		quantization?: 'int8' | 'int4' | 'none'
		threads?: number
		gpuLayers?: number
	}
	customEndpointConfig?: {
		url: string
		authType: 'bearer' | 'basic' | 'custom'
		authValue: string
		headers?: Record<string, string>
	}
	// Performance and reliability
	modelFailoverConfig?: {
		fallbackModels: string[]
		maxRetries: number
		retryDelay: number
	}
	loadBalancingConfig?: {
		strategy: 'round-robin' | 'least-loaded' | 'fastest-response'
		endpoints: string[]
	}
	cachingConfig?: {
		strategy: 'memory' | 'disk' | 'distributed'
		ttl: number
		maxSize: number
	}
	// Monitoring and analytics
	monitoringConfig?: {
		metrics: ('latency' | 'throughput' | 'errors' | 'costs')[]
		logLevel: 'debug' | 'info' | 'warn' | 'error'
		alertThresholds?: Record<string, number>
	}
	analyticsConfig?: {
		trackUsage: boolean
		trackPerformance: boolean
		trackCosts: boolean
		customMetrics?: string[]
	}
	// Security and compliance
	securityConfig?: {
		encryption: boolean
		auditLogging: boolean
		dataRetention: number
		complianceStandards: string[]
	}
	// African market specific configurations
	africanMarketConfig?: {
		// Localization
		languages: {
			swahili?: boolean
			hausa?: boolean
			yoruba?: boolean
			amharic?: boolean
			zulu?: boolean
			customLanguages?: string[]
		}
		// Infrastructure adaptation
		offlineSupport: boolean
		lowBandwidthMode: boolean
		powerSavingMode: boolean
		
		// Payment integration
		paymentMethods: {
			mobileMoney: boolean
			supportedProviders: string[]
			localBanks: boolean
			cryptoCurrencies: boolean
		}
		
		// Educational features
		tutorialMode: boolean
		codeExamples: boolean
		localizedDocs: boolean
		communitySupport: boolean
		
		// Market specific pricing
		regionalPricing: boolean
		studentDiscounts: boolean
		startupPrograms: boolean
		enterpriseCustomization: boolean
	}
=======
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
}

export type ApiConfiguration = ApiHandlerOptions & {
	apiProvider?: ApiProvider
	id?: string // stable unique identifier
}

// Models

export interface ModelInfo {
	maxTokens?: number
	contextWindow: number
	supportsImages?: boolean
	supportsComputerUse?: boolean
	supportsPromptCache: boolean // this value is hardcoded for now
	inputPrice?: number
	outputPrice?: number
	cacheWritesPrice?: number
	cacheReadsPrice?: number
	description?: string
	reasoningEffort?: "low" | "medium" | "high"
<<<<<<< HEAD
	// Core IDE capabilities
	ideCapabilities?: {
		// Code intelligence
		codeCompletion: boolean
		codeRefactoring: boolean
		codeNavigation: boolean
		codeDefinition: boolean
		codeReferences: boolean
		codeHover: boolean
		codeHighlighting: boolean
		codeFormatting: boolean
		codeLinting: boolean
		codeActions: boolean
		
		// Development features
		debugging: boolean
		testing: boolean
		documenting: boolean
		versionControl: boolean
		
		// Advanced features
		pairProgramming: boolean
		codeReview: boolean
		projectManagement: boolean
		teamCollaboration: boolean
		
		// Language support
		supportedLanguages: string[]
		languageServerProtocols: string[]
		
		// Performance
		responseTime: number
		accuracyScore: number
		qualityMetrics: {
			precision: number
			recall: number
			f1Score: number
		}
	}
=======
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
}

// Anthropic
// https://docs.anthropic.com/en/docs/about-claude/models
export type AnthropicModelId = keyof typeof anthropicModels
<<<<<<< HEAD
export const anthropicDefaultModelId: AnthropicModelId = "claude-3-7-sonnet-20240229"
export const anthropicModels = {
	"claude-3-7-sonnet-20240229": {
		maxTokens: 16384,
=======
export const anthropicDefaultModelId: AnthropicModelId = "claude-3-7-sonnet-20240606"
export const anthropicModels = {
	"claude-3-7-sonnet-20240606": {
		maxTokens: 8192,
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: true,
		inputPrice: 3.0, // $3 per million input tokens
		outputPrice: 15.0, // $15 per million output tokens
		cacheWritesPrice: 3.75, // $3.75 per million tokens
		cacheReadsPrice: 0.3, // $0.30 per million tokens
<<<<<<< HEAD
		description: "Latest Claude 3.7 Sonnet model with enhanced reasoning capabilities and improved performance",
		reasoningEffort: "high"
	},
	"claude-3-7-haiku-20240229": {
		maxTokens: 16384,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 1.0,
		outputPrice: 5.0,
		cacheWritesPrice: 1.25,
		cacheReadsPrice: 0.1,
		description: "Latest Claude 3.7 Haiku model optimized for faster responses",
		reasoningEffort: "medium"
=======
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
	},
	"claude-3-5-sonnet-20241022": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: true,
<<<<<<< HEAD
		inputPrice: 3.0,
		outputPrice: 15.0,
		cacheWritesPrice: 3.75,
		cacheReadsPrice: 0.3,
=======
		inputPrice: 3.0, // $3 per million input tokens
		outputPrice: 15.0, // $15 per million output tokens
		cacheWritesPrice: 3.75, // $3.75 per million tokens
		cacheReadsPrice: 0.3, // $0.30 per million tokens
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
	},
	"claude-3-5-haiku-20241022": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 1.0,
		outputPrice: 5.0,
		cacheWritesPrice: 1.25,
		cacheReadsPrice: 0.1,
	},
	"claude-3-opus-20240229": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 15.0,
		outputPrice: 75.0,
		cacheWritesPrice: 18.75,
		cacheReadsPrice: 1.5,
	},
	"claude-3-haiku-20240307": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.25,
		outputPrice: 1.25,
		cacheWritesPrice: 0.3,
		cacheReadsPrice: 0.03,
	},
} as const satisfies Record<string, ModelInfo> // as const assertion makes the object deeply readonly

// AWS Bedrock
// https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
export interface MessageContent {
	type: "text" | "image" | "video" | "tool_use" | "tool_result"
	text?: string
	source?: {
		type: "base64"
		data: string | Uint8Array // string for Anthropic, Uint8Array for Bedrock
		media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
	}
	// Video specific fields
	format?: string
	s3Location?: {
		uri: string
		bucketOwner?: string
	}
	// Tool use and result fields
	toolUseId?: string
	name?: string
	input?: any
	output?: any // Used for tool_result type
}

export type BedrockModelId = keyof typeof bedrockModels
<<<<<<< HEAD
export const bedrockDefaultModelId: BedrockModelId = "anthropic.claude-3-7-sonnet-20240229-v1:0"
=======
export const bedrockDefaultModelId: BedrockModelId = "anthropic.claude-3-5-sonnet-20241022-v2:0"
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
export const bedrockModels = {
	"amazon.nova-pro-v1:0": {
		maxTokens: 5000,
		contextWindow: 300_000,
		supportsImages: true,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.8,
		outputPrice: 3.2,
		cacheWritesPrice: 0.8, // per million tokens
		cacheReadsPrice: 0.2, // per million tokens
	},
	"amazon.nova-lite-v1:0": {
		maxTokens: 5000,
		contextWindow: 300_000,
		supportsImages: true,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.06,
		outputPrice: 0.024,
		cacheWritesPrice: 0.06, // per million tokens
		cacheReadsPrice: 0.015, // per million tokens
	},
	"amazon.nova-micro-v1:0": {
		maxTokens: 5000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.035,
		outputPrice: 0.14,
		cacheWritesPrice: 0.035, // per million tokens
		cacheReadsPrice: 0.00875, // per million tokens
	},
<<<<<<< HEAD
	"anthropic.claude-3-7-sonnet-20240229-v1:0": {
		maxTokens: 16384,
=======
	"anthropic.claude-3-5-sonnet-20241022-v2:0": {
		maxTokens: 8192,
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
<<<<<<< HEAD
		description: "Latest Claude 3.7 Sonnet model with enhanced reasoning capabilities",
		reasoningEffort: "high"
	},
	"anthropic.claude-3-7-haiku-20240229-v1:0": {
		maxTokens: 16384,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 1.0,
		outputPrice: 5.0,
		description: "Latest Claude 3.7 Haiku model optimized for faster responses",
		reasoningEffort: "medium"
=======
		cacheWritesPrice: 3.75, // per million tokens
		cacheReadsPrice: 0.3, // per million tokens
	},
	"anthropic.claude-3-5-haiku-20241022-v1:0": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 1.0,
		outputPrice: 5.0,
		cacheWritesPrice: 1.0,
		cacheReadsPrice: 0.08,
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
	},
	"anthropic.claude-3-5-sonnet-20240620-v1:0": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
	},
	"anthropic.claude-3-opus-20240229-v1:0": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 15.0,
		outputPrice: 75.0,
	},
	"anthropic.claude-3-sonnet-20240229-v1:0": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
	},
	"anthropic.claude-3-haiku-20240307-v1:0": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.25,
		outputPrice: 1.25,
	},
	"meta.llama3-3-70b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.72,
		outputPrice: 0.72,
	},
	"meta.llama3-2-90b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: true,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.72,
		outputPrice: 0.72,
	},
	"meta.llama3-2-11b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: true,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.16,
		outputPrice: 0.16,
	},
	"meta.llama3-2-3b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.15,
		outputPrice: 0.15,
	},
	"meta.llama3-2-1b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.1,
		outputPrice: 0.1,
	},
	"meta.llama3-1-405b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 2.4,
		outputPrice: 2.4,
	},
	"meta.llama3-1-70b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.72,
		outputPrice: 0.72,
	},
	"meta.llama3-1-8b-instruct-v1:0": {
		maxTokens: 8192,
		contextWindow: 8_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.22,
		outputPrice: 0.22,
	},
	"meta.llama3-70b-instruct-v1:0": {
		maxTokens: 2048,
		contextWindow: 8_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 2.65,
		outputPrice: 3.5,
	},
	"meta.llama3-8b-instruct-v1:0": {
		maxTokens: 2048,
		contextWindow: 4_000,
		supportsImages: false,
		supportsComputerUse: false,
		supportsPromptCache: false,
		inputPrice: 0.3,
		outputPrice: 0.6,
	},
} as const satisfies Record<string, ModelInfo>

// Glama
// https://glama.ai/models
export const glamaDefaultModelId = "anthropic/claude-3-5-sonnet"
export const glamaDefaultModelInfo: ModelInfo = {
	maxTokens: 8192,
	contextWindow: 200_000,
	supportsImages: true,
	supportsComputerUse: true,
	supportsPromptCache: true,
	inputPrice: 3.0,
	outputPrice: 15.0,
	cacheWritesPrice: 3.75,
	cacheReadsPrice: 0.3,
	description:
		"The new Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: New Sonnet scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal\n\n_This is a faster endpoint, made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the provider's side instead of OpenRouter's. For requests that pass moderation, it's identical to the [Standard](/anthropic/claude-3.5-sonnet) variant._",
}

export const requestyDefaultModelInfo: ModelInfo = {
	maxTokens: 8192,
	contextWindow: 200_000,
	supportsImages: true,
	supportsComputerUse: true,
	supportsPromptCache: true,
	inputPrice: 3.0,
	outputPrice: 15.0,
	cacheWritesPrice: 3.75,
	cacheReadsPrice: 0.3,
	description:
		"The new Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: New Sonnet scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal\n\n_This is a faster endpoint, made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the provider's side instead of OpenRouter's. For requests that pass moderation, it's identical to the [Standard](/anthropic/claude-3.5-sonnet) variant._",
}
export const requestyDefaultModelId = "anthropic/claude-3-5-sonnet"

// OpenRouter
// https://openrouter.ai/models?order=newest&supported_parameters=tools
<<<<<<< HEAD
export const openRouterDefaultModelId = "anthropic/claude-3.5-sonnet:beta" // will always exist in openRouterModels
=======
export const openRouterDefaultModelId = "anthropic/claude-3-7-sonnet:beta" // will always exist in openRouterModels
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
export const openRouterDefaultModelInfo: ModelInfo = {
	maxTokens: 8192,
	contextWindow: 200_000,
	supportsImages: true,
	supportsComputerUse: true,
	supportsPromptCache: true,
	inputPrice: 3.0,
	outputPrice: 15.0,
	cacheWritesPrice: 3.75,
	cacheReadsPrice: 0.3,
	description:
<<<<<<< HEAD
		"The new Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: New Sonnet scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal\n\n_This is a faster endpoint, made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the provider's side instead of OpenRouter's. For requests that pass moderation, it's identical to the [Standard](/anthropic/claude-3.5-sonnet) variant._",
=======
		"Claude 3.7 Sonnet delivers exceptional coding capabilities, faster inference, and best-in-class agentic abilities. Claude 3.7 Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with high precision\n- Data science: Navigates unstructured data while using multiple tools for insights\n- Visual processing: Excels at interpreting charts, graphs, and images\n- Agentic tasks: Exceptional tool use for complex, multi-step problem solving\n\n#multimodal\n\n_This is a faster endpoint, made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the provider's side instead of OpenRouter's._",
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
}

// Vertex AI
// https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude
export type VertexModelId = keyof typeof vertexModels
<<<<<<< HEAD
export const vertexDefaultModelId: VertexModelId = "claude-3-7-sonnet-v1@20240229"
export const vertexModels = {
	"claude-3-7-sonnet-v1@20240229": {
		maxTokens: 16384,
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
		description: "Latest Claude 3.7 Sonnet model with enhanced reasoning capabilities",
		reasoningEffort: "high"
	},
	"claude-3-7-haiku-v1@20240229": {
		maxTokens: 16384,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 1.0,
		outputPrice: 5.0,
		description: "Latest Claude 3.7 Haiku model optimized for faster responses",
		reasoningEffort: "medium"
	},
=======
export const vertexDefaultModelId: VertexModelId = "claude-3-5-sonnet-v2@20241022"
export const vertexModels = {
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
	"claude-3-5-sonnet-v2@20241022": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
	},
	"claude-3-5-sonnet@20240620": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 3.0,
		outputPrice: 15.0,
	},
	"claude-3-5-haiku@20241022": {
		maxTokens: 8192,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 1.0,
		outputPrice: 5.0,
	},
	"claude-3-opus@20240229": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 15.0,
		outputPrice: 75.0,
	},
	"claude-3-haiku@20240307": {
		maxTokens: 4096,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.25,
		outputPrice: 1.25,
	},
} as const satisfies Record<string, ModelInfo>

export const openAiModelInfoSaneDefaults: ModelInfo = {
	maxTokens: -1,
	contextWindow: 128_000,
	supportsImages: true,
	supportsPromptCache: false,
	inputPrice: 0,
	outputPrice: 0,
}

export const requestyModelInfoSaneDefaults: ModelInfo = {
	maxTokens: -1,
	contextWindow: 128_000,
	supportsImages: true,
	supportsPromptCache: false,
	inputPrice: 0,
	outputPrice: 0,
}

// Gemini
// https://ai.google.dev/gemini-api/docs/models/gemini
export type GeminiModelId = keyof typeof geminiModels
export const geminiDefaultModelId: GeminiModelId = "gemini-2.0-flash-001"
export const geminiModels = {
	"gemini-2.0-flash-001": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.0-flash-lite-preview-02-05": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.0-pro-exp-02-05": {
		maxTokens: 8192,
		contextWindow: 2_097_152,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.0-flash-thinking-exp-01-21": {
		maxTokens: 65_536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.0-flash-thinking-exp-1219": {
		maxTokens: 8192,
		contextWindow: 32_767,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.0-flash-exp": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-1.5-flash-002": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-1.5-flash-exp-0827": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-1.5-flash-8b-exp-0827": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-1.5-pro-002": {
		maxTokens: 8192,
		contextWindow: 2_097_152,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-1.5-pro-exp-0827": {
		maxTokens: 8192,
		contextWindow: 2_097_152,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-exp-1206": {
		maxTokens: 8192,
		contextWindow: 2_097_152,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
} as const satisfies Record<string, ModelInfo>

// OpenAI Native
// https://openai.com/api/pricing/
export type OpenAiNativeModelId = keyof typeof openAiNativeModels
export const openAiNativeDefaultModelId: OpenAiNativeModelId = "gpt-4o"
export const openAiNativeModels = {
	// don't support tool use yet
	"o3-mini": {
		maxTokens: 100_000,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 1.1,
		outputPrice: 4.4,
		reasoningEffort: "medium",
	},
	"o3-mini-high": {
		maxTokens: 100_000,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 1.1,
		outputPrice: 4.4,
		reasoningEffort: "high",
	},
	"o3-mini-low": {
		maxTokens: 100_000,
		contextWindow: 200_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 1.1,
		outputPrice: 4.4,
		reasoningEffort: "low",
	},
	o1: {
		maxTokens: 100_000,
		contextWindow: 200_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 15,
		outputPrice: 60,
	},
	"o1-preview": {
		maxTokens: 32_768,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 15,
		outputPrice: 60,
	},
	"o1-mini": {
		maxTokens: 65_536,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 1.1,
		outputPrice: 4.4,
	},
	"gpt-4o": {
		maxTokens: 4_096,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 5,
		outputPrice: 15,
	},
	"gpt-4o-mini": {
		maxTokens: 16_384,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.15,
		outputPrice: 0.6,
	},
} as const satisfies Record<string, ModelInfo>

// DeepSeek
// https://platform.deepseek.com/docs/api
export type DeepSeekModelId = keyof typeof deepSeekModels
export const deepSeekDefaultModelId: DeepSeekModelId = "deepseek-chat"
export const deepSeekModels = {
	"deepseek-chat": {
		maxTokens: 8192,
		contextWindow: 64_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.014, // $0.014 per million tokens
		outputPrice: 0.28, // $0.28 per million tokens
		description: `DeepSeek-V3 achieves a significant breakthrough in inference speed over previous models. It tops the leaderboard among open-source models and rivals the most advanced closed-source models globally.`,
	},
	"deepseek-reasoner": {
		maxTokens: 8192,
		contextWindow: 64_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.55, // $0.55 per million tokens
		outputPrice: 2.19, // $2.19 per million tokens
		description: `DeepSeek-R1 achieves performance comparable to OpenAI-o1 across math, code, and reasoning tasks.`,
	},
} as const satisfies Record<string, ModelInfo>

// Azure OpenAI
// https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-deprecation
// https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#api-specs
export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"

// Mistral
// https://docs.mistral.ai/getting-started/models/models_overview/
export type MistralModelId = keyof typeof mistralModels
export const mistralDefaultModelId: MistralModelId = "codestral-latest"
export const mistralModels = {
	"codestral-latest": {
		maxTokens: 32_768,
		contextWindow: 256_000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.3,
		outputPrice: 0.9,
	},
} as const satisfies Record<string, ModelInfo>

// Unbound Security
export const unboundDefaultModelId = "anthropic/claude-3-5-sonnet-20241022"
export const unboundDefaultModelInfo: ModelInfo = {
	maxTokens: 8192,
	contextWindow: 200_000,
	supportsImages: true,
	supportsPromptCache: true,
	inputPrice: 3.0,
	outputPrice: 15.0,
	cacheWritesPrice: 3.75,
	cacheReadsPrice: 0.3,
}
<<<<<<< HEAD

// Optima AI (Gemma 3)
export type OptimaModelId = keyof typeof optimaModels
export const optimaDefaultModelId: OptimaModelId = "optima-3-27b"
export const optimaModels = {
	"optima-3-27b": {
		maxTokens: 8192,
		contextWindow: 128_000,
		supportsImages: true,
		supportsComputerUse: true,
		supportsPromptCache: true,
		inputPrice: 0.5, // $0.5 per million tokens
		outputPrice: 2.0, // $2.0 per million tokens
		cacheWritesPrice: 0.5,
		cacheReadsPrice: 0.1,
		description: "Optima AI's flagship model powered by Gemma 3, offering high reasoning capabilities and multimodal support",
		reasoningEffort: "high",
		ideCapabilities: {
			codeCompletion: true,
			codeRefactoring: true,
			codeNavigation: true,
			codeDefinition: true,
			codeReferences: true,
			codeHover: true,
			codeHighlighting: true,
			codeFormatting: true,
			codeLinting: true,
			codeActions: true,
			debugging: true,
			testing: true,
			documenting: true,
			versionControl: true,
			pairProgramming: true,
			codeReview: true,
			projectManagement: true,
			teamCollaboration: true,
			supportedLanguages: ["typescript", "javascript", "python", "java", "cpp", "rust", "go", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql"],
			languageServerProtocols: ["LSP", "DAP"],
			responseTime: 100,
			accuracyScore: 0.95,
			qualityMetrics: {
				precision: 0.92,
				recall: 0.94,
				f1Score: 0.93
			}
		}
	}
} as const satisfies Record<string, ModelInfo>
=======
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
