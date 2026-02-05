import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client using the environment variable directly
// The system ensures process.env.API_KEY is available and valid in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIExplanation = async (lessonContent: string, question: string) => {
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
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key not valid")) {
      return "The AI service is reporting an invalid API key. Please check your project settings.";
    }
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment!";
  }
};

export const generateQuizHints = async (question: string) => {
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