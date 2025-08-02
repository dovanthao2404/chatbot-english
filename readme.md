# React Chatbot with OpenAI Library

A beautiful, modern full-screen chatbot interface built with React that integrates with OpenAI using the official JavaScript library for real AI responses.

## Features

- 🎨 Modern, responsive design with gradient backgrounds
- 💬 Real-time chat interface with typing indicators
- 🤖 OpenAI library integration for intelligent responses
- 📱 Mobile-friendly responsive layout
- 🖥️ Full-screen immersive experience
- ⏰ Message timestamps
- ⌨️ Enter key support for sending messages
- 🔄 Auto-scroll to latest messages
- 🎭 Smooth animations and hover effects
- 🔐 Environment-based configuration
- 💾 Conversation persistence with localStorage
- 🗑️ Clear conversation functionality
- 📝 Rich text formatting support (Markdown-like)
- 💻 Code block syntax highlighting
- 🔧 Function calling for enhanced English learning features

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure OpenAI:
   Create a `.env` file in the root directory with your OpenAI credentials:
   ```
   REACT_APP_OPENAI_API_KEY=your-api-key-here
   REACT_APP_OPENAI_MODEL=your-model-name
   REACT_APP_OPENAI_BASE_URL=your-base-url
   ```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## OpenAI Configuration

The chatbot uses the official OpenAI JavaScript library for generating responses. The configuration includes:

- **API Key**: Your OpenAI API key
- **Model**: The model name to use (default: gpt-4o-mini)
- **Base URL**: Your OpenAI-compatible endpoint URL

### Default Configuration
The app comes with default values for testing:
- API Key: `sk-VH7ExDjVCsqEuINFcSXCwA`
- Model: `gpt-4o-mini`
- Base URL: `https://aiportalapi.stu-platform.live/jpe`

## Usage

- Type your message in the input field at the bottom
- Press Enter or click the send button to send your message
- The chatbot will respond using OpenAI with conversation context
- All messages are displayed with timestamps
- The conversation persists across browser sessions using localStorage
- Click the trash icon in the header to clear the conversation history
- Enjoy the full-screen immersive chat experience
- Rich formatting is preserved including code blocks, bold, italic, and links

## Project Structure

```
src/
├── components/
│   ├── Chatbot.js          # Main chatbot component with OpenAI integration
│   └── Chatbot.css         # Chatbot styles
├── utils/
│   ├── openai-client.js    # OpenAI client utilities
│   └── functions.js        # English learning functions for function calling
├── config.js               # Configuration settings
├── App.js                  # Main app component
├── App.css                 # App styles
├── index.js                # Entry point
└── index.css               # Global styles
```

## Function Calling Features

The chatbot includes advanced function calling capabilities for enhanced English learning:

### Available Functions:
- **translate_text**: Translate between languages (English, Vietnamese, Spanish)
- **get_grammar_explanation**: Detailed grammar explanations with examples and formulas
- **get_vocabulary_examples**: Word definitions, examples, synonyms, and antonyms
- **get_pronunciation_guide**: Phonetic transcriptions and pronunciation tips
- **get_conversation_practice**: Role-play scenarios and discussion topics
- **get_common_mistakes**: Common English mistakes with corrections and explanations

### Example Usage:
- "Can you translate 'hello' to Vietnamese?"
- "Explain the past perfect tense"
- "Give me examples of the word 'perseverance'"
- "How do you pronounce 'schedule'?"
- "Let's practice a conversation about travel"
- "What are common grammar mistakes for Vietnamese speakers?"

## OpenAI Library Integration

The chatbot integrates with OpenAI using the official JavaScript library:

```javascript
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.API_KEY,
  baseURL: OPENAI_CONFIG.BASE_URL,
  dangerouslyAllowBrowser: true
});

// Create chat completion
const completion = await openai.chat.completions.create({
  model: OPENAI_CONFIG.MODEL,
  messages: [
    {
      role: "system",
      content: CHATBOT_CONFIG.SYSTEM_PROMPT
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage
    }
  ],
  temperature: 0.3,
  max_tokens: 500,
  stream: false
});

return completion.choices[0].message.content;
```

## Function Calling Implementation

The chatbot implements function calling using OpenAI's tool calling protocol:

```javascript
// Function calling configuration
const options = {
  temperature: CHATBOT_CONFIG.TEMPERATURE,
  max_tokens: CHATBOT_CONFIG.MAX_TOKENS
};

if (FUNCTION_CONFIG.ENABLE_FUNCTION_CALLING) {
  options.tools = FUNCTION_CONFIG.functions.map(func => ({
    type: "function",
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters
    }
  }));
  options.tool_choice = "auto";
}

// Handle tool calls
if (response.tool_calls && FUNCTION_CONFIG.ENABLE_FUNCTION_CALLING) {
  const toolCall = response.tool_calls[0];
  const functionName = toolCall.function.name;
  const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
  
  // Execute the function
  const functionResult = await executeFunction(functionName, functionArgs);
  
  // Make a second API call with the function result
  const secondApiMessages = [
    ...apiMessages,
    {
      role: "assistant",
      content: null,
      tool_calls: [toolCall]
    },
    {
      role: "tool",
      tool_call_id: toolCall.id,
      content: functionResult
    }
  ];

  return await createChatCompletion(secondApiMessages, options);
}
```

## Utility Functions

The chatbot includes utility functions for better code organization:

```javascript
// Helper function to create chat completion
export const createChatCompletion = async (messages, options = {}) => {
  const completion = await openai.chat.completions.create({
    model: OPENAI_CONFIG.MODEL,
    messages,
    temperature: options.temperature || 0.3,
    max_tokens: options.max_tokens || 500,
    stream: false,
    ...options
  });

  return completion.choices[0].message.content;
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
```

## localStorage Integration

The chatbot automatically saves and loads conversation history using localStorage:

```javascript
// Save messages to localStorage
const saveMessagesToStorage = (newMessages) => {
  localStorage.setItem('chatbot-messages', JSON.stringify(newMessages));
};

// Load messages from localStorage
const loadMessagesFromStorage = () => {
  const savedMessages = localStorage.getItem('chatbot-messages');
  if (savedMessages) {
    const parsedMessages = JSON.parse(savedMessages);
    return parsedMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }
  return defaultMessages;
};
```

## Rich Text Formatting

The chatbot preserves original formatting from OpenAI responses:

- **Line Breaks**: Preserved with proper spacing
- **Code Blocks**: Syntax-highlighted with dark theme for bot messages
- **Inline Code**: Styled with monospace font and background
- **Bold Text**: **Bold formatting** using `**text**`
- **Italic Text**: *Italic formatting* using `*text*`
- **Links**: Clickable links with hover effects
- **Lists**: Both bulleted and numbered lists
- **Markdown-like**: Supports common markdown syntax

## Full-Screen Design

The chatbot is designed to provide an immersive full-screen experience:

- **Viewport Coverage**: Takes up the entire screen (100vw x 100vh)
- **No Borders**: Removed container borders and shadows for seamless experience
- **Responsive**: Adapts to all screen sizes and orientations
- **Clean Layout**: Maximizes chat area for better readability

## Customization

You can customize the chatbot by:

- Modifying the system prompt in the `callOpenAI` function
- Updating the color scheme in the CSS files
- Adding more features like message persistence, user authentication, etc.
- Changing the OpenAI model parameters (temperature, max_tokens, etc.)

## Error Handling

The chatbot includes robust error handling:
- Network errors are caught and display a user-friendly message
- API failures fall back to a helpful error message
- Loading states are properly managed with typing indicators

## Technologies Used

- React 18
- OpenAI JavaScript Library
- CSS3 with modern features (Grid, Flexbox, Animations)
- JavaScript ES6+ (Async/Await, Modules)
