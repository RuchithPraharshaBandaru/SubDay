import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper to clean Markdown code blocks (```json ... ```) from the response
const cleanJSON = (text) => {
  if (!text) return null;
  // Remove markdown code blocks if present
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Connection error.");
  }
};

export const parseSubscriptionFile = async (file) => {
  try {
    // 1. Convert file to base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. Initialize Gemini 2.5 Flash with JSON enforcement
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Analyze this image (receipt or statement).
      Extract the following subscription details into a JSON object:
      {
        "name": "Service Name",
        "price": "0.00",
        "frequency": "Monthly" or "Yearly",
        "day": 1 (day of month due, default to 1 if unknown)
      }
      If no subscription is found, return null.
    `;

    // 3. Generate content
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } }
    ]);

    const text = result.response.text();
    
    // 4. Clean and Parse
    return cleanJSON(text);

  } catch (error) {
    console.error("File Parsing Error:", error);
    return null;
  }
};