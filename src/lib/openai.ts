import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || 'placeholder-openai-key';

export const isAIEnabled = !!process.env.OPENAI_API_KEY;

if (!isAIEnabled) {
  console.warn('⚠️ OpenAI API Key is missing. AI Chatbot will return mock responses.');
}

export const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // For development demo if needed
});
