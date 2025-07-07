import OpenAI from "openai";

export const openAiInstance = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});
