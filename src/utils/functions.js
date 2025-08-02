// English Learning Functions for Function Calling

// Function registry - maps function names to their implementations
const functionRegistry = {
  translate_text: translateText,
  get_grammar_explanation: getGrammarExplanation,
  get_vocabulary_examples: getVocabularyExamples,
  get_pronunciation_guide: getPronunciationGuide,
  get_conversation_practice: getConversationPractice,
  get_common_mistakes: getCommonMistakes
};

// Execute a function by name with arguments
export const executeFunction = async (functionName, functionArgs) => {
  try {
    if (functionRegistry[functionName]) {
      return await functionRegistry[functionName](functionArgs);
    } else {
      throw new Error(`Function ${functionName} not found`);
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    return `Error: Unable to execute ${functionName}. ${error.message}`;
  }
};

// Translation function
async function translateText(args) {
  const { text, from_language = 'auto', to_language = 'en' } = args;
  
  if (!text) {
    return "Error: No text provided for translation.";
  }

  // Simulated translation - in a real app, you'd use a translation API
  const translations = {
    'vi': {
      'hello': 'xin chào',
      'thank you': 'cảm ơn',
      'goodbye': 'tạm biệt',
      'how are you': 'bạn khỏe không'
    },
    'es': {
      'hello': 'hola',
      'thank you': 'gracias',
      'goodbye': 'adiós',
      'how are you': '¿cómo estás?'
    }
  };

  const lowerText = text.toLowerCase();
  
  if (from_language === 'en' && to_language === 'vi') {
    const vietnameseTranslation = translations['vi'][lowerText] || `[Vietnamese translation of: ${text}]`;
    return `English: "${text}"\nVietnamese: "${vietnameseTranslation}"`;
  } else if (from_language === 'vi' && to_language === 'en') {
    const englishTranslation = Object.keys(translations['vi']).find(key => translations['vi'][key] === lowerText);
    return `Vietnamese: "${text}"\nEnglish: "${englishTranslation || `[English translation of: ${text}]`}"`;
  } else if (from_language === 'en' && to_language === 'es') {
    const spanishTranslation = translations['es'][lowerText] || `[Spanish translation of: ${text}]`;
    return `English: "${text}"\nSpanish: "${spanishTranslation}"`;
  } else {
    return `Translation from ${from_language} to ${to_language}:\n"${text}" → [Translation would be provided by a real translation service]`;
  }
}

// Grammar explanation function
async function getGrammarExplanation(args) {
  const { grammar_topic, level = 'intermediate' } = args;
  
  if (!grammar_topic) {
    return "Error: No grammar topic provided.";
  }

  const grammarExplanations = {
    'past perfect': {
      beginner: {
        explanation: "The past perfect is used to show that one action happened before another action in the past.",
        examples: [
          "I had finished my homework before I went to bed.",
          "She had already eaten when I arrived."
        ],
        formula: "Subject + had + past participle"
      },
      intermediate: {
        explanation: "The past perfect (had + past participle) indicates that an action was completed before another past action or time.",
        examples: [
          "By the time I got home, my sister had already cooked dinner.",
          "I had never seen such a beautiful sunset before that day."
        ],
        formula: "Subject + had + past participle + before/when/by the time + past simple"
      },
      advanced: {
        explanation: "The past perfect can also be used in reported speech, conditional sentences, and to express unreal past situations.",
        examples: [
          "He said he had been working there for five years.",
          "If I had known about the meeting, I would have attended."
        ],
        formula: "Various uses: reported speech, conditionals, unreal past"
      }
    },
    'conditionals': {
      beginner: {
        explanation: "Conditionals are sentences that express 'if' situations.",
        examples: [
          "If it rains, I will stay home.",
          "If I were rich, I would travel the world."
        ],
        formula: "If + present simple, will + base form (Type 1)\nIf + past simple, would + base form (Type 2)"
      },
      intermediate: {
        explanation: "There are four main types of conditionals, each expressing different degrees of possibility and time.",
        examples: [
          "If it rains tomorrow, I'll take an umbrella. (Type 1 - real possibility)",
          "If I won the lottery, I would buy a house. (Type 2 - unlikely)",
          "If I had studied harder, I would have passed the exam. (Type 3 - past)"
        ],
        formula: "Type 1: If + present, will + base\nType 2: If + past, would + base\nType 3: If + past perfect, would have + past participle"
      },
      advanced: {
        explanation: "Mixed conditionals combine different time references and can express complex hypothetical situations.",
        examples: [
          "If I had studied medicine, I would be a doctor now.",
          "If I were you, I would have accepted the job offer."
        ],
        formula: "Mixed: If + past perfect, would + base form (past condition, present result)"
      }
    },
    'phrasal verbs': {
      beginner: {
        explanation: "Phrasal verbs are verbs combined with prepositions or adverbs that change the meaning.",
        examples: [
          "Look up = search for information",
          "Give up = stop trying"
        ],
        formula: "Verb + preposition/adverb = new meaning"
      },
      intermediate: {
        explanation: "Phrasal verbs can be separable or inseparable, and some can have multiple meanings.",
        examples: [
          "I'll look up the word in the dictionary. (separable)",
          "We need to put up with the noise. (inseparable)",
          "The plane took off on time. (literal and figurative meanings)"
        ],
        formula: "Separable: verb + object + particle OR verb + particle + object\nInseparable: verb + particle + object only"
      },
      advanced: {
        explanation: "Phrasal verbs are essential for natural English and often replace formal single-word verbs.",
        examples: [
          "The meeting was called off due to bad weather. (cancelled)",
          "She came up with a brilliant idea. (thought of)",
          "We need to catch up on the latest news. (get updated)"
        ],
        formula: "Often replace formal verbs: call off = cancel, come up with = think of, catch up = get updated"
      }
    }
  };

  const topic = grammar_topic.toLowerCase();
  const explanation = grammarExplanations[topic]?.[level] || grammarExplanations[topic]?.['intermediate'];

  if (!explanation) {
    return `Grammar explanation for "${grammar_topic}" (${level} level):\n\nThis grammar topic would be explained with examples and rules appropriate for ${level} level learners.`;
  }

  return `Grammar: ${grammar_topic.charAt(0).toUpperCase() + grammar_topic.slice(1)} (${level} level)\n\n📚 Explanation:\n${explanation.explanation}\n\n📝 Examples:\n${explanation.examples.map(ex => `• ${ex}`).join('\n')}\n\n📋 Formula:\n${explanation.formula}`;
}

// Vocabulary examples function
async function getVocabularyExamples(args) {
  const { word, context } = args;
  
  if (!word) {
    return "Error: No word provided.";
  }

  const vocabularyData = {
    'perseverance': {
      definition: "Persistence in doing something despite difficulty or delay in achieving success.",
      examples: [
        "Her perseverance in learning English paid off when she got the job.",
        "The team showed great perseverance during the difficult project.",
        "Success comes from perseverance, not luck."
      ],
      synonyms: ["determination", "persistence", "tenacity", "resolve"],
      antonyms: ["giving up", "quitting", "surrender"]
    },
    'serendipity': {
      definition: "The occurrence and development of events by chance in a happy or beneficial way.",
      examples: [
        "Meeting my business partner was pure serendipity.",
        "The discovery of penicillin was a serendipitous event.",
        "Sometimes the best opportunities come through serendipity."
      ],
      synonyms: ["chance", "fortune", "luck", "coincidence"],
      antonyms: ["misfortune", "bad luck", "planned"]
    },
    'ubiquitous': {
      definition: "Present, appearing, or found everywhere.",
      examples: [
        "Smartphones have become ubiquitous in modern society.",
        "The ubiquitous presence of social media affects everyone.",
        "Coffee shops are ubiquitous in this neighborhood."
      ],
      synonyms: ["omnipresent", "widespread", "prevalent", "common"],
      antonyms: ["rare", "scarce", "uncommon", "limited"]
    }
  };

  const wordData = vocabularyData[word.toLowerCase()] || {
    definition: `A word meaning "${word}"`,
    examples: [
      `I learned the word "${word}" in my English class.`,
      `Can you use "${word}" in a sentence?`,
      `The word "${word}" is commonly used in English.`
    ],
    synonyms: ["similar words", "related terms"],
    antonyms: ["opposite words", "contrary terms"]
  };

  let result = `Vocabulary: ${word}\n\n📖 Definition:\n${wordData.definition}\n\n📝 Examples:\n${wordData.examples.map(ex => `• ${ex}`).join('\n')}\n\n🔄 Synonyms:\n${wordData.synonyms.join(', ')}\n\n⚖️ Antonyms:\n${wordData.antonyms.join(', ')}`;

  if (context) {
    result += `\n\n🎯 Context: ${context}`;
  }

  return result;
}

// Pronunciation guide function
async function getPronunciationGuide(args) {
  const { word, accent = 'american' } = args;
  
  if (!word) {
    return "Error: No word provided.";
  }

  const pronunciationData = {
    'schedule': {
      american: {
        phonetic: "/ˈskɛdʒuːl/",
        pronunciation: "SKED-jool",
        audio_hint: "Sounds like 'SKED' + 'jool'"
      },
      british: {
        phonetic: "/ˈʃɛdjuːl/",
        pronunciation: "SHED-yool",
        audio_hint: "Sounds like 'SHED' + 'yool'"
      }
    },
    'tomato': {
      american: {
        phonetic: "/təˈmeɪtoʊ/",
        pronunciation: "tuh-MAY-toh",
        audio_hint: "Sounds like 'tuh' + 'MAY' + 'toh'"
      },
      british: {
        phonetic: "/təˈmɑːtəʊ/",
        pronunciation: "tuh-MAH-toh",
        audio_hint: "Sounds like 'tuh' + 'MAH' + 'toh'"
      }
    },
    'water': {
      american: {
        phonetic: "/ˈwɔːtər/",
        pronunciation: "WAW-ter",
        audio_hint: "Sounds like 'WAW' + 'ter'"
      },
      british: {
        phonetic: "/ˈwɔːtə/",
        pronunciation: "WAW-tuh",
        audio_hint: "Sounds like 'WAW' + 'tuh'"
      }
    }
  };

  const wordData = pronunciationData[word.toLowerCase()] || {
    american: {
      phonetic: `[Phonetic transcription for "${word}"]`,
      pronunciation: `[Pronunciation guide for "${word}"]`,
      audio_hint: `Practice saying "${word}" slowly and clearly`
    },
    british: {
      phonetic: `[British phonetic transcription for "${word}"]`,
      pronunciation: `[British pronunciation guide for "${word}"]`,
      audio_hint: `Practice saying "${word}" with British accent`
    }
  };

  const accentData = wordData[accent] || wordData.american;

  return `Pronunciation: ${word} (${accent} accent)\n\n🔤 Phonetic: ${accentData.phonetic}\n🗣️ Pronunciation: ${accentData.pronunciation}\n💡 Tip: ${accentData.audio_hint}\n\n🎯 Practice: Repeat the word slowly, then at normal speed.`;
}

// Conversation practice function
async function getConversationPractice(args) {
  const { topic, level = 'intermediate', scenario_type = 'roleplay' } = args;
  
  if (!topic) {
    return "Error: No topic provided.";
  }

  const scenarios = {
    'travel': {
      beginner: {
        roleplay: {
          title: "At the Airport",
          roles: ["Traveler", "Airport Staff"],
          dialogue: [
            "Traveler: Excuse me, where is the check-in counter?",
            "Staff: It's on the second floor, near gate 5.",
            "Traveler: Thank you. What time does my flight leave?",
            "Staff: Your flight leaves at 2:30 PM. Please arrive 2 hours early."
          ],
          vocabulary: ["check-in", "counter", "gate", "flight", "arrive"]
        },
        discussion: {
          title: "Travel Preferences",
          questions: [
            "Do you prefer traveling alone or with others?",
            "What's your favorite way to travel?",
            "Where would you like to go on your next trip?"
          ]
        }
      },
      intermediate: {
        roleplay: {
          title: "Hotel Booking",
          roles: ["Guest", "Hotel Receptionist"],
          dialogue: [
            "Guest: Hi, I'd like to book a room for next weekend.",
            "Receptionist: Of course! How many nights and what type of room?",
            "Guest: Two nights, and I'd prefer a room with a view.",
            "Receptionist: We have a deluxe room with ocean view available."
          ],
          vocabulary: ["book", "deluxe", "ocean view", "available", "prefer"]
        }
      }
    },
    'food': {
      beginner: {
        roleplay: {
          title: "At a Restaurant",
          roles: ["Customer", "Waiter"],
          dialogue: [
            "Customer: Can I see the menu, please?",
            "Waiter: Here you are. Today's special is grilled salmon.",
            "Customer: That sounds good. I'll have that.",
            "Waiter: Excellent choice. Would you like something to drink?"
          ],
          vocabulary: ["menu", "special", "grilled", "salmon", "choice"]
        }
      }
    },
    'work': {
      intermediate: {
        roleplay: {
          title: "Job Interview",
          roles: ["Interviewer", "Candidate"],
          dialogue: [
            "Interviewer: Tell me about your previous work experience.",
            "Candidate: I worked as a software developer for 3 years.",
            "Interviewer: What are your strengths and weaknesses?",
            "Candidate: I'm detail-oriented and sometimes spend too much time perfecting things."
          ],
          vocabulary: ["experience", "developer", "strengths", "weaknesses", "detail-oriented"]
        }
      }
    }
  };

  const topicData = scenarios[topic.toLowerCase()] || scenarios['travel'];
  const levelData = topicData[level] || topicData['intermediate'] || topicData['beginner'];
  const scenarioData = levelData[scenario_type] || levelData['roleplay'];

  if (!scenarioData) {
    return `Conversation Practice: ${topic} (${level} level, ${scenario_type})\n\nThis scenario would provide conversation practice for ${topic} at ${level} level using ${scenario_type} format.`;
  }

  let result = `Conversation Practice: ${scenarioData.title}\n\n🎭 Scenario: ${scenario_type}\n📊 Level: ${level}\n👥 Roles: ${scenarioData.roles.join(' & ')}\n\n💬 Dialogue:\n${scenarioData.dialogue.map(line => `• ${line}`).join('\n')}`;

  if (scenarioData.vocabulary) {
    result += `\n\n📚 Key Vocabulary:\n${scenarioData.vocabulary.join(', ')}`;
  }

  if (scenarioData.questions) {
    result += `\n\n❓ Discussion Questions:\n${scenarioData.questions.map(q => `• ${q}`).join('\n')}`;
  }

  return result;
}

// Common mistakes function
async function getCommonMistakes(args) {
  const { category = 'grammar', native_language } = args;

  const mistakesData = {
    grammar: {
      general: [
        {
          mistake: "I am going to home",
          correct: "I am going home",
          explanation: "Don't use 'to' before 'home' - it's an adverb, not a noun"
        },
        {
          mistake: "I have 20 years old",
          correct: "I am 20 years old",
          explanation: "Use 'am' with age, not 'have'"
        },
        {
          mistake: "I am agree with you",
          correct: "I agree with you",
          explanation: "Don't use 'am' with 'agree' - it's a verb, not an adjective"
        }
      ],
      vietnamese: [
        {
          mistake: "I very like this movie",
          correct: "I really like this movie",
          explanation: "Use 'really' instead of 'very' before verbs"
        },
        {
          mistake: "I am study English",
          correct: "I am studying English",
          explanation: "Use present continuous (-ing) for current actions"
        }
      ]
    },
    vocabulary: {
      general: [
        {
          mistake: "I am boring",
          correct: "I am bored",
          explanation: "Use '-ed' for feelings, '-ing' for things that cause feelings"
        },
        {
          mistake: "I lost my phone yesterday",
          correct: "I lost my phone yesterday",
          explanation: "This is actually correct! 'Lost' is the past tense of 'lose'"
        }
      ]
    },
    pronunciation: {
      general: [
        {
          mistake: "pronouncing 'th' as 't' or 'd'",
          correct: "th sound (tongue between teeth)",
          explanation: "Practice putting your tongue between your teeth for 'th' sounds"
        },
        {
          mistake: "not stressing the right syllable",
          correct: "stress the correct syllable",
          explanation: "English is a stress-timed language - syllable stress is crucial"
        }
      ]
    },
    idioms: {
      general: [
        {
          mistake: "I am agree with you",
          correct: "I agree with you",
          explanation: "This is a common mistake - 'agree' is a verb, not an adjective"
        },
        {
          mistake: "I am going to home",
          correct: "I am going home",
          explanation: "Don't use 'to' before 'home' - it's an adverb"
        }
      ]
    }
  };

  const categoryData = mistakesData[category] || mistakesData.grammar;
  const languageSpecific = native_language && categoryData[native_language.toLowerCase()];
  const mistakes = languageSpecific ? [...languageSpecific, ...categoryData.general] : categoryData.general;

  let result = `Common ${category.charAt(0).toUpperCase() + category.slice(1)} Mistakes`;

  if (native_language) {
    result += ` (for ${native_language} speakers)`;
  }

  result += `:\n\n${mistakes.map((mistake, index) => 
    `${index + 1}. ❌ ${mistake.mistake}\n   ✅ ${mistake.correct}\n   💡 ${mistake.explanation}`
  ).join('\n\n')}`;

  return result;
} 