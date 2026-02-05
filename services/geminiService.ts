import { GoogleGenAI } from "@google/genai";

/**
 * Safely access environment variables.
 */
const safeGetEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

const apiKey = safeGetEnv('API_KEY');

// Initialize the Gemini API client safely
const ai = new GoogleGenAI({ apiKey: apiKey || 'missing-api-key' });

export const getAIExplanation = async (lessonContent: string, question: string) => {
  if (!apiKey || apiKey === 'missing-api-key') {
    return "AI Study Assistant is currently not configured. Please add an API_KEY to your environment variables.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${lessonContent}\n\nStudent Question: ${question}`,
      config: {
        systemInstruction: "You are a helpful and encouraging LMS AI Tutor. Use the provided lesson context to explain concepts clearly. If the question is outside the scope of the lesson, politely inform the student but offer a brief general answer.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment!";
  }
};

export const generateQuizHints = async (question: string) => {
  if (!apiKey || apiKey === 'missing-api-key') {
    return "Think carefully about the key concepts from the lesson content!";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Help the student solve this quiz question without giving the direct answer: "${question}"`,
      config: {
        systemInstruction: "Provide a subtle hint for the multiple-choice question. Do not reveal the answer.",
        temperature: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    return "Think about the main concepts we discussed in the last lesson!";
  }
};