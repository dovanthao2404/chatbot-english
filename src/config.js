// OpenAI Configuration
export const OPENAI_CONFIG = {
  // Default values - these can be overridden by environment variables
  API_KEY: "sk-huX9DUcEp3kw0HVBcWH4_A",
  MODEL: "GPT-4o-mini",
  BASE_URL: "https://aiportalapi.stu-platform.live/jpe",
};

// Chatbot Configuration
export const CHATBOT_CONFIG = {
  SYSTEM_PROMPT: `You are an AI English tutor who helps learners improve their English through conversation.
You have access to special functions to help with English learning:
- translate_text: Translate between languages
- get_grammar_explanation: Get detailed grammar explanations
- get_vocabulary_examples: Get word definitions and examples
- get_pronunciation_guide: Get pronunciation help
- get_conversation_practice: Generate practice scenarios
- get_common_mistakes: Show common English mistakes

`,
  TEMPERATURE: 0.3,
  MAX_TOKENS: 500,
  TYPING_DELAY: 1000 // Minimum delay to show typing indicator
};

// UI Configuration
export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  AUTO_SCROLL_DELAY: 100,
  ANIMATION_DURATION: 300
};

// Function Calling Configuration for English Learning
export const FUNCTION_CONFIG = {
  // Enable function calling
  ENABLE_FUNCTION_CALLING: true,
  
  // Available functions that the AI can call for English learning
  functions: [
    {
      name: "translate_text",
      description: "Translate text between languages to help with English learning",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to translate"
          },
          from_language: {
            type: "string",
            description: "Source language code (e.g., 'vi', 'es', 'fr')"
          },
          to_language: {
            type: "string",
            description: "Target language code (usually 'en' for English)"
          }
        },
        required: ["text", "to_language"]
      }
    },
    {
      name: "get_grammar_explanation",
      description: "Get detailed grammar explanations and examples for English learning",
      parameters: {
        type: "object",
        properties: {
          grammar_topic: {
            type: "string",
            description: "The grammar topic to explain (e.g., 'past perfect', 'conditionals', 'phrasal verbs')"
          },
          level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "The learner's level",
            default: "intermediate"
          }
        },
        required: ["grammar_topic"]
      }
    },
    {
      name: "get_vocabulary_examples",
      description: "Get vocabulary examples, synonyms, and usage for English words",
      parameters: {
        type: "object",
        properties: {
          word: {
            type: "string",
            description: "The English word to get examples for"
          },
          context: {
            type: "string",
            description: "Optional context or topic for more relevant examples"
          }
        },
        required: ["word"]
      }
    },
    {
      name: "get_pronunciation_guide",
      description: "Get pronunciation guide and phonetic transcription for English words",
      parameters: {
        type: "object",
        properties: {
          word: {
            type: "string",
            description: "The English word to get pronunciation for"
          },
          accent: {
            type: "string",
            enum: ["american", "british", "australian"],
            description: "The accent to use",
            default: "american"
          }
        },
        required: ["word"]
      }
    },
    {
      name: "get_conversation_practice",
      description: "Generate conversation practice scenarios for English learning",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "The conversation topic (e.g., 'travel', 'food', 'work')"
          },
          level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "The learner's level",
            default: "intermediate"
          },
          scenario_type: {
            type: "string",
            enum: ["roleplay", "discussion", "interview"],
            description: "Type of conversation practice",
            default: "roleplay"
          }
        },
        required: ["topic"]
      }
    },
    {
      name: "get_common_mistakes",
      description: "Get common English mistakes and how to avoid them",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["grammar", "vocabulary", "pronunciation", "idioms"],
            description: "Category of mistakes to focus on",
            default: "grammar"
          },
          native_language: {
            type: "string",
            description: "The learner's native language to provide specific advice"
          }
        },
        required: []
      }
    }
  ]
};