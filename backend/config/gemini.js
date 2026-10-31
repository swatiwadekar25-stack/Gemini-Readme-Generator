import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in the .env file");
  }

  return new GoogleGenAI({ apiKey });
};

export default getGeminiClient;