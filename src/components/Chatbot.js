import React, { useState, useRef, useEffect } from 'react';
import { CHATBOT_CONFIG, FUNCTION_CONFIG } from '../config';
import { createChatCompletion, formatConversationHistory } from '../utils/openai-client';
import { executeFunction } from '../utils/functions';
import './Chatbot.css';

const Chatbot = () => {
  // Load messages from localStorage on component mount
  const loadMessagesFromStorage = () => {
    try {
      const savedMessages = localStorage.getItem('chatbot-messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    
    // Return default welcome message if no saved messages
    return [
      {
        id: 1,
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState(loadMessagesFromStorage);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage whenever messages change
  const saveMessagesToStorage = (newMessages) => {
    try {
      localStorage.setItem('chatbot-messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Function to call OpenAI using the library with function calling support
  const callOpenAI = async (userMessage) => {
    try {
      // Prepare conversation history for API call
      const conversationHistory = formatConversationHistory(messages);

      const apiMessages = [
        {
          role: "system",
          content: CHATBOT_CONFIG.SYSTEM_PROMPT
        },
        ...conversationHistory.map(msg => ({
          ...msg,
          content: typeof msg.content === 'object' && msg.content !== null && 'content' in msg.content
            ? msg.content.content
            : msg.content
        })),
        {
          role: "user",
          content: typeof userMessage === 'object' && userMessage !== null && 'content' in userMessage
            ? userMessage.content
            : userMessage
        }
      ];

      // Add function calling if enabled
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

      const response = await createChatCompletion(apiMessages, options);

      // Check if the response includes tool calls
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
            content: typeof functionResult === 'object' && functionResult !== null && 'content' in functionResult
              ? functionResult.content
              : functionResult
          }
        ];

        return await createChatCompletion(secondApiMessages, {
          temperature: CHATBOT_CONFIG.TEMPERATURE,
          max_tokens: CHATBOT_CONFIG.MAX_TOKENS
        });
      }

      return response.content || response;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call OpenAI
      const botResponse = await callOpenAI(inputMessage);
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Fallback response if API fails
      const fallbackResponse = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to format message text with proper formatting
  const formatMessageText = (text) => {
    if (typeof text !== 'string') {
      if (text === null || text === undefined) return '';
      text = String(text);
    }
    return text
      // Convert line breaks to <br> tags
      .replace(/\n/g, '<br>')
      // Convert code blocks (```code```) 
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code class="language-$1">$2</code></pre>')
      // Convert inline code (`code`)
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Convert bold text (**text**)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Convert italic text (*text*)
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Convert links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Convert lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Convert numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  };

  // Function to clear conversation history
  const clearConversation = () => {
    const defaultMessage = [
      {
        id: 1,
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
    setMessages(defaultMessage);
    localStorage.removeItem('chatbot-messages');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <div className="avatar-icon">🤖</div>
        </div>
        <div className="chatbot-info">
          <h3>AI Assistant</h3>
          <p>Online</p>
        </div>
        <button 
          onClick={clearConversation}
          className="clear-button"
          title="Clear conversation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => {
          // Ensure formatMessageText always receives a string
          let displayText = message.text;
          if (typeof displayText === 'object' && displayText !== null && 'content' in displayText) {
            displayText = displayText.content;
          }
          return (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <div 
                  className="message-text"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageText(displayText) 
                  }}
                />
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="1"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 