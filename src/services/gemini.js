import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyD1a5q-cQn2j_fOVAE39axbgMd5ycTdgRk";

export const generateAIResponse = async (userMessage, subscriptions, currency) => {
  try {
    const activeSubs = subscriptions.filter(s => s.status !== 'Canceled');
    const totalCost = activeSubs
      .reduce((acc, sub) => {
        const price = parseFloat(sub.price || 0);
        if (sub.frequency === 'Yearly') return acc + price / 12;
        if (sub.frequency === 'Weekly') return acc + price * 4;
        return acc + price;
      }, 0)
      .toFixed(2);

    const subsContext = activeSubs
      .map(s => `- ${s.name} (${s.frequency}): $${s.price}`)
      .join("\n");

    const prompt = `Act as a financial assistant. User Currency: ${currency}. Total Monthly (USD base): $${totalCost}. Active Subs: ${subsContext}. Question: "${userMessage}". Keep it short.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return text;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Connection error.");
  }
};
