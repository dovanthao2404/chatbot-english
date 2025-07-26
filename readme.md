# React Chatbot with OpenAPI

A beautiful, modern full-screen chatbot interface built with React that integrates with OpenAPI for real AI responses.

## Features

- 🎨 Modern, responsive design with gradient backgrounds
- 💬 Real-time chat interface with typing indicators
- 🤖 OpenAPI integration for intelligent responses
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

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAPI access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure OpenAPI:
   Create a `.env` file in the root directory with your OpenAPI credentials:
   ```
   REACT_APP_OPENAPI_ENDPOINT=https://your-openapi-endpoint.com
   REACT_APP_OPENAPI_KEY=your-api-key-here
   REACT_APP_OPENAPI_MODEL=your-model-name
   ```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## OpenAPI Configuration

The chatbot uses OpenAPI for generating responses. The configuration includes:

- **Endpoint**: Your OpenAPI endpoint URL
- **API Key**: Your OpenAPI API key
- **Model**: The model name to use (default: gpt-4o-mini)

### Default Configuration
The app comes with default values for testing:
- Endpoint: `https://aiportalapi.stu-platform.live/jpe`
- API Key: `sk-VH7ExDjVCsqEuINFcSXCwA`
- Model: `gpt-4o-mini`

## Usage

- Type your message in the input field at the bottom
- Press Enter or click the send button to send your message
- The chatbot will respond using OpenAPI with conversation context
- All messages are displayed with timestamps
- The conversation persists across browser sessions using localStorage
- Click the trash icon in the header to clear the conversation history
- Enjoy the full-screen immersive chat experience
- Rich formatting is preserved including code blocks, bold, italic, and links

## Project Structure

```
src/
├── components/
│   ├── Chatbot.js          # Main chatbot component with OpenAPI integration
│   └── Chatbot.css         # Chatbot styles
├── config.js               # Configuration settings
├── App.js                  # Main app component
├── App.css                 # App styles
├── index.js                # Entry point
└── index.css               # Global styles
```

## API Integration

The chatbot integrates with OpenAPI using the following JavaScript implementation with conversation history:

```javascript
const callOpenAPI = async (userMessage) => {
  // Prepare conversation history for API call
  const conversationHistory = messages
    .filter(msg => msg.sender !== 'bot' || msg.text !== "Hello! I'm your AI assistant. How can I help you today?")
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

  const response = await fetch(`${OPENAPI_CONFIG.ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAPI_CONFIG.API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAPI_CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
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
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
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

The chatbot preserves original formatting from OpenAPI responses:

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

- Modifying the system prompt in the `callOpenAPI` function
- Updating the color scheme in the CSS files
- Adding more features like message persistence, user authentication, etc.
- Changing the OpenAPI model parameters (temperature, max_tokens, etc.)

## Error Handling

The chatbot includes robust error handling:
- Network errors are caught and display a user-friendly message
- API failures fall back to a helpful error message
- Loading states are properly managed with typing indicators

## Technologies Used

- React 18
- OpenAPI
- CSS3 with modern features (Grid, Flexbox, Animations)
- JavaScript ES6+ (Async/Await, Fetch API) 

