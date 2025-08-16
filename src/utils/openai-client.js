import OpenAI from 'openai';
import { pipeline, env } from '@xenova/transformers';
import { OPENAI_CONFIG } from '../config';
// import { ChromaClient } from 'chromadb';

// Configure transformers environment for browser
env.allowRemoteModels = true;
env.allowLocalModels = false;

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.API_KEY,
  baseURL: OPENAI_CONFIG.BASE_URL,
  dangerouslyAllowBrowser: true // Only for client-side usage
});

// ChromaDB client initialization (using ChromaDB JS library)
class ChromaDBClient {
  constructor() {
    this.collectionName = 'chatbot_memory';
    this.isAvailable = false;
    this.hasChecked = false;
    this.apiBase = 'http://localhost:8080/api/v1';
  }

  async checkAvailability() {
    if (this.hasChecked) return this.isAvailable;
    try {
      const res = await fetch(`${this.apiBase}/heartbeat`);
      this.isAvailable = res.ok;
      if (this.isAvailable) {
        console.log('ChromaDB BE connected successfully');
      }
    } catch (error) {
      console.warn('ChromaDB BE not available:', error.message);
      this.isAvailable = false;
    }
    this.hasChecked = true;
    return this.isAvailable;
  }

  async createCollection() {
    const available = await this.checkAvailability();
    if (!available) {
      console.warn('ChromaDB BE not available, skipping collection creation');
      return false;
    }
    try {
      const res = await fetch(`${this.apiBase}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.collectionName,
          metadata: { description: 'Chatbot conversation memory' }
        })
      });
      if (res.ok) {
        console.log('ChromaDB BE collection created or exists');
        return true;
      } else {
        console.warn('Failed to create ChromaDB BE collection:', res.status);
        return false;
      }
    } catch (error) {
      console.warn('ChromaDB BE create collection error:', error.message);
      return false;
    }
  }

  async addEmbedding(id, text, metadata = {}) {
    const available = await this.checkAvailability();
    if (!available) {
      console.warn('ChromaDB BE not available, skipping embedding storage');
      return false;
    }
    try {
      const res = await fetch(`${this.apiBase}/collections/${this.collectionName}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [id],
          documents: [text],
          metadatas: [metadata]
        })
      });
      if (res.ok) {
        console.log('Embedding added via BE successfully');
        return true;
      } else {
        console.warn('Failed to add embedding via BE:', res.status);
        return false;
      }
    } catch (error) {
      console.error('ChromaDB BE add embedding error:', error);
      return false;
    }
  }

  async queryEmbeddings(queryText, nResults = 5) {
    const available = await this.checkAvailability();
    if (!available) {
      console.warn('ChromaDB BE not available, returning empty context');
      return [];
    }
    try {
      const res = await fetch(`${this.apiBase}/collections/${this.collectionName}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_texts: [queryText],
          n_results: nResults
        })
      });
      if (!res.ok) {
        console.warn('ChromaDB BE query failed:', res.status);
        return [];
      }
      const data = await res.json();
      return data.documents?.[0] || [];
    } catch (error) {
      console.error('ChromaDB BE query error:', error);
      return [];
    }
  }
}

// HuggingFace TTS using Transformers.js
class TransformersTTS {
  constructor() {
    this.synthesizer = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._loadModel();
    await this.initPromise;
  }

  async _loadModel() {
    try {
      console.log('Loading TTS model...');
      // Use a lightweight TTS model that works in browser
      this.synthesizer = await pipeline(
        'text-to-speech',
        'bosonai/higgs-audio-v2-generation-3B-base',
        {
          quantized: false,
          device: 'webgpu', // Use WebGPU if available, fallback to CPU
        }
      );
      this.isInitialized = true;
      console.log('TTS model loaded successfully');
    } catch (error) {
      console.error('Failed to load TTS model:', error);
      // Fallback to Web Speech API
      this.useFallback = true;
      this.isInitialized = true;
    }
  }

  async textToSpeech(text, options = {}) {
    await this.initialize();

    try {
      if (this.useFallback || !this.synthesizer) {
        return this._webSpeechFallback(text, options);
      }

      // Use Transformers.js TTS
      const speaker_embeddings = options.speaker_embeddings || this._getDefaultSpeakerEmbeddings();
      
      const result = await this.synthesizer(text, {
        speaker_embeddings: speaker_embeddings,
        ...options
      });

      // Convert the result to audio blob
      const audioData = result.audio;
      const sampleRate = result.sampling_rate || 16000;
      
      return this._createAudioBlob(audioData, sampleRate);
    } catch (error) {
      console.error('TTS generation error:', error);
      // Fallback to Web Speech API
      return this._webSpeechFallback(text, options);
    }
  }

  _getDefaultSpeakerEmbeddings() {
    // Default speaker embeddings for SpeechT5
    return new Float32Array(512).fill(0.5);
  }

  _createAudioBlob(audioData, sampleRate) {
    // Convert Float32Array to WAV blob
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async _webSpeechFallback(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Find English voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve(null);
      utterance.onerror = reject;

      speechSynthesis.speak(utterance);
    });
  }

  async playAudio(audioBlob) {
    if (!audioBlob) return; // Web Speech API doesn't return blob

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  async speakText(text, options = {}) {
    const audioBlob = await this.textToSpeech(text, options);
    if (audioBlob) {
      await this.playAudio(audioBlob);
    }
  }
}

// Initialize clients
export const chromaDB = new ChromaDBClient();
export const transformersTTS = new TransformersTTS();

// Enhanced chat completion with memory and TTS
export const createChatCompletionWithMemory = async (messages, options = {}) => {
  try {
    // Query relevant context from ChromaDB if available
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    let relevantContext = [];

    const isChromaAvailable = await chromaDB.checkAvailability();
    if (isChromaAvailable && lastUserMessage) {
      relevantContext = await chromaDB.queryEmbeddings(lastUserMessage.content, 3);
    }

    // Nếu ChromaDB trả về kết quả thì chỉ trả về câu trả lời Assistant đầu tiên
    if (relevantContext.length > 0) {
      // Tìm câu trả lời Assistant đầu tiên trong context
      // Giả sử mỗi đoạn có dạng: 'User: ...\nAssistant: ...'
      let firstAssistant = '';
      for (let i = 0; i < relevantContext.length; i++) {
        const match = relevantContext.match(/Assistant:\s*([\s\S]*)/);
        if (match && match[1]) {
          firstAssistant = match[1].trim();
          break;
        }
      }
      // Nếu không có match thì trả về toàn bộ document
      let content = firstAssistant;
      if (!content) {
        content = relevantContext[0] ? relevantContext[0].toString() : '';
      }
      return {
        role: 'assistant',
        content,
        from: 'chromadb'
      };
    }

    // Nếu không có kết quả từ ChromaDB thì gọi OpenAI
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages,
      temperature: options.temperature || 0.3,
      max_tokens: options.max_tokens || 500,
      stream: false,
      ...options
    });

    const message = completion.choices[0].message;

    // Store conversation in ChromaDB for future reference if available
    if (isChromaAvailable && lastUserMessage && message.content) {
      const conversationId = `conv_${Date.now()}`;
      await chromaDB.addEmbedding(
        conversationId,
        `User: ${lastUserMessage.content}\nAssistant: ${message.content}`,
        { timestamp: new Date().toISOString() }
      );
    }

    // Generate speech if requested
    if (options.enableTTS && message.content) {
      try {
        const audioBlob = await transformersTTS.textToSpeech(message.content, options.ttsOptions);
        message.audioBlob = audioBlob;
      } catch (ttsError) {
        console.warn('TTS generation failed:', ttsError);
      }
    }

    return message;
  } catch (error) {
    console.error('Enhanced chat completion error:', error);
    throw error;
  }
};

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

// Utility functions
export const initializeMemorySystem = async () => {
  try {
    const available = await chromaDB.checkAvailability();
    if (!available) {
      console.warn('ChromaDB not available. Memory features will be disabled.');
      console.warn('To enable memory features, please run: pip install chromadb && chroma run --host localhost --port 8000');
      return false;
    }
    
    const created = await chromaDB.createCollection();
    if (created) {
      console.log('Memory system initialized successfully');
    }
    return created;
  } catch (error) {
    console.error('Failed to initialize memory system:', error);
    return false;
  }
};

export const speakText = async (text, options = {}) => {
  try {
    await transformersTTS.speakText(text, options);
  } catch (error) {
    console.error('Speech synthesis error:', error);
  }
};

// Initialize TTS on module load
transformersTTS.initialize().catch(console.error);