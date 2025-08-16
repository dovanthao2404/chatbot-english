import React, { useState, useRef, useEffect } from 'react';
import { CHATBOT_CONFIG, FUNCTION_CONFIG } from '../config';
import { 
  createChatCompletion, 
  createChatCompletionWithMemory,
  formatConversationHistory,
  initializeMemorySystem,
  speakText,
  transformersTTS
} from '../utils/openai-client';
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
  const [enableTTS, setEnableTTS] = useState(false);
  const [enableMemory, setEnableMemory] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
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

  // Initialize memory system and TTS on component mount
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        setIsInitializing(true);
        
        // Initialize memory system
        if (enableMemory) {
          const memoryInitialized = await initializeMemorySystem();
          if (!memoryInitialized) {
            console.warn('Memory system failed to initialize, but app will continue without memory features');
          }
        }
        
        // Initialize TTS
        await transformersTTS.initialize();
        console.log('TTS system initialized');
        
      } catch (error) {
        console.error('Failed to initialize systems:', error);
        // Continue without failing - the app should still work
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSystems();
  }, [enableMemory]);

  // Function to call OpenAI using the library with function calling support
  const callOpenAI = async (userMessage) => {
    try {
      // Use enhanced chat completion with memory if enabled
      if (enableMemory) {
        const conversationHistory = formatConversationHistory(messages);
        const apiMessages = [
          {
            role: "system",
            content: CHATBOT_CONFIG.SYSTEM_PROMPT
          },
          ...conversationHistory.map(msg => ({
            ...msg,
            content: (() => {
              let c = msg.content;
              if (typeof c === 'object' && c !== null && 'content' in c) c = c.content;
              if (typeof c !== 'string' || c == null) return '';
              return c;
            })()
          })),
          {
            role: "user",
            content: (() => {
              let c = userMessage;
              if (typeof c === 'object' && c !== null && 'content' in c) c = c.content;
              if (typeof c !== 'string' || c == null) return '';
              return c;
            })()
          }
        ];

        const options = {
          temperature: CHATBOT_CONFIG.TEMPERATURE,
          max_tokens: CHATBOT_CONFIG.MAX_TOKENS
        };

        // Add function calling if enabled
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

        const response = await createChatCompletionWithMemory(apiMessages, options);

        // Function calling support for API responses with tool_calls
        if (response.tool_calls && Array.isArray(response.tool_calls) && response.tool_calls.length > 0) {
          const toolCall = response.tool_calls[0];
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments || '{}');

          // Execute the function locally
          const functionResult = await executeFunction(functionName, functionArgs);

          // Prepare follow-up messages for API
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

          const finalResponse = await createChatCompletionWithMemory(secondApiMessages, options);

          const responseText = finalResponse.content || finalResponse;

          // TTS playback for final response
          if (enableTTS) {
            let ttsPlayed = false;
            if (finalResponse.audioBlob) {
              try {
                await transformersTTS.playAudio(finalResponse.audioBlob);
                ttsPlayed = true;
              } catch (ttsError) {
                console.warn('TTS playback failed:', ttsError);
              }
            }
            if (!ttsPlayed && responseText) {
              try {
                await speakText(responseText, {
                  lang: 'en-US',
                  rate: 1.0,
                  pitch: 1.0
                });
              } catch (ttsError) {
                console.warn('TTS fallback failed:', ttsError);
              }
            }
          }
          return responseText;
        }

        // Handle TTS if enabled
        if (enableTTS) {
          let ttsPlayed = false;
          if (response.audioBlob) {
            try {
              await transformersTTS.playAudio(response.audioBlob);
              ttsPlayed = true;
            } catch (ttsError) {
              console.warn('TTS playback failed:', ttsError);
            }
          }
          const responseText = response.content || response;
          if (!ttsPlayed && responseText) {
            try {
              await speakText(responseText, {
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0
              });
            } catch (ttsError) {
              console.warn('TTS fallback failed:', ttsError);
            }
          }
        }

        return response.content || response;
      } else {
        // Use regular chat completion without memory
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

          const finalResponse = await createChatCompletion(secondApiMessages, {
            temperature: CHATBOT_CONFIG.TEMPERATURE,
            max_tokens: CHATBOT_CONFIG.MAX_TOKENS
          });

          const responseText = finalResponse.content || finalResponse;
          
          // Generate TTS if enabled (use browser Web Speech API for easier-to-hear voice)
          if (enableTTS && responseText) {
            try {
              await speakText(responseText, {
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0
              });
            } catch (ttsError) {
              console.warn('TTS generation failed:', ttsError);
            }
          }

          return responseText;
        }

        const responseText = response.content || response;
        
        // Generate TTS if enabled
        if (enableTTS && responseText) {
          try {
            await speakText(responseText, {
              lang: 'en-US',
              rate: 1.0,
              pitch: 1.0
            });
          } catch (ttsError) {
            console.warn('TTS generation failed:', ttsError);
          }
        }

        return responseText;
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isInitializing) return;

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

  // Function to format message text and render Pronunciation guide with React button
  const formatMessageTextWithPronunciation = (text) => {
    if (typeof text !== 'string') {
      if (text === null || text === undefined) return [''];
      text = String(text);
    }
    const lines = text.split(/\n/);
    const elements = [];
    const re = /(?:\*\*|__)?(Pronunciation guide)(?:\*\*|__)?\s*:\s*([^\n\r]+)/iu;
    // Tìm từ nằm trong dấu ngoặc kép sau "The word"
    let wordToSpeak = null;
    const wordMatch = text.match(/The word\s+"([^"]+)"/i);
    if (wordMatch) {
      wordToSpeak = wordMatch[1];
    }
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const match = line.match(re);
      if (match) {
        const guide = match[2];
        elements.push(
          <div key={idx} style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1976d2', fontSize: 18, marginRight: 4 }}>
                {/* SVG loa */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 3 13 7 13 12 18 12 6 7 11 3 11"></polygon><path d="M16.5 8.5a5 5 0 0 1 0 7"></path></svg>
              </span>
              Pronunciation guide: <strong>{guide}</strong>
            </span>
            <button
              className="pronounce-btn"
              style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
              onClick={() => speakText(wordToSpeak ? wordToSpeak : guide, { lang: 'en-US', rate: 1.0, pitch: 1.0 })}
              title="Phát âm"
            >Phát âm</button>
          </div>
        );
      } else {
        let formatted = line
          .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code class="language-$1">$2</code></pre>')
          .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
          .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
          .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
        elements.push(<span key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />);
        // Nếu không phải dòng cuối cùng, thêm <br />
        if (idx < lines.length - 1) elements.push(<br key={`br-${idx}`} />);
      }
    }
    return elements;
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
          <p>{isInitializing ? 'Initializing...' : 'Online'}</p>
        </div>
        <div className="chatbot-controls">
          <button
            onClick={() => {
              // Tìm câu hỏi cuối cùng của người dùng
              const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
              if (lastUserMsg) {
                let text = lastUserMsg.text;
                if (typeof text === 'object' && text !== null && 'content' in text) {
                  text = text.content;
                }
                // Tìm từ/cụm từ nằm trong dấu ngoặc kép
                let match = text.match(/"([^"]+)"/);
                let word = match ? match[1] : null;
                // Nếu không có dấu ngoặc kép, thử tìm sau từ 'phát âm'
                if (!word) {
                  match = text.match(/phát âm\s*(\w+)/i);
                  word = match ? match[1] : null;
                }
                if (word) {
                  speakText(word, { lang: 'en-US', rate: 1.0, pitch: 1.0 });
                }
              }
            }}
            className={`control-button`}
            title={'Phát âm từ cần thiết trong câu hỏi'}
          >
            🔊
          </button>
          <button
            onClick={() => setEnableMemory(!enableMemory)}
            className={`control-button ${enableMemory ? 'active' : ''}`}
            title={enableMemory ? 'Disable Memory' : 'Enable Memory'}
          >
            🧠
          </button>
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
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => {
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
                <div className="message-text">
                  {formatMessageTextWithPronunciation(displayText)}
                </div>
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
            disabled={isTyping || isInitializing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || isInitializing}
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