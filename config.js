// Azure OpenAI Configuration
export const AZURE_CONFIG = {
  // Default values - these can be overridden by environment variables
  ENDPOINT: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
  API_KEY: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
  DEPLOYMENT_NAME: process.env.REACT_APP_AZURE_DEPLOYMENT_NAME,
  API_VERSION: '2024-07-01-preview'
};

// Chatbot Configuration
export const CHATBOT_CONFIG = {
  SYSTEM_PROMPT: "You are a helpful AI assistant. Provide clear, concise, and helpful responses.",
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