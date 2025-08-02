import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.API_KEY,
  baseURL: OPENAI_CONFIG.BASE_URL,
  dangerouslyAllowBrowser: true // Only for client-side usage
});

// Helper function to create chat completion
export const createChatCompletion = async (messages, options = {}) => {
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages,
      temperature: options.temperature || 0.3,
      max_tokens: options.max_tokens || 500,
      stream: false,
      ...options
    });

    const message = completion.choices[0].message;
    
    // Return the full message object for function calling support
    return message;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Helper function to format conversation history
export const formatConversationHistory = (messages, excludeWelcomeMessage = true) => {
  return messages
    .filter(msg => !excludeWelcomeMessage || msg.text !== "Hello! I'm your AI assistant. How can I help you today?")
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
}; 