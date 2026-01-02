
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SpendingInsight } from "../types";

// Fix: Strictly use process.env.API_KEY for initialization as required by @google/genai coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[]): Promise<SpendingInsight> => {
  if (transactions.length === 0) {
    return {
      summary: "Your premium financial journey begins here. Start logging to unlock AI insights.",
      recommendations: ["Log your first transaction."],
      savingOpportunities: "Insights will appear once spending patterns are established."
    };
  }

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const transactionsSummary = transactions
    .map(t => `${t.date}: ${t.description} (${t.category}) - ₹${t.amount}`)
    .join('\n');

  const categoriesStr = Object.entries(categoryTotals)
    .map(([cat, total]) => `${cat}: ₹${total.toFixed(2)}`)
    .join(', ');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these transactions for an Indian user and provide aggressive, specific financial advice.\nCategory Totals: ${categoriesStr}\nDetailed Log:\n${transactionsSummary}`,
      config: {
        systemInstruction: `You are an elite Indian wealth manager and brutal financial optimizer. 
        Analyze the user's spending data and provide:
        1. A blunt summary of their spending habits in the Indian context.
        2. 3-5 HIGHLY SPECIFIC, actionable tips using ₹. 
           - If Petrol/Fuel spend is high, suggest using the Metro, local buses, or switching to an EV/CNG.
           - If 'Food & Dining' is high, suggest using local 'Mandis' instead of premium supermarkets or cutting down on Swiggy/Zomato.
           - If 'Shopping' is high, suggest waiting for Great Indian Festival sales or using specific credit card reward points.
           - Be aggressive with numbers. If they spend ₹5000 on coffee, tell them that's ₹60,000 a year wasted.
        3. Identify the single largest 'leak' in their budget.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A blunt summary of spending habits." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Specific actionable tips based on transaction amounts in INR." 
            },
            savingOpportunities: { type: Type.STRING, description: "The single biggest budget leak identified." }
          },
          required: ["summary", "recommendations", "savingOpportunities"],
          propertyOrdering: ["summary", "recommendations", "savingOpportunities"]
        },
      },
    });

    return JSON.parse(response.text || '{}') as SpendingInsight;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return {
      summary: "Wealth optimization analysis currently unavailable.",
      recommendations: ["Monitor your high-spending categories manually."],
      savingOpportunities: "Check your largest recurring costs."
    };
  }
};

export const suggestCategory = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Description: "${description}". Select the best category from: Food & Dining, Shopping, Transport, Bills & Utilities, Entertainment, Health, Travel, Others.`,
      config: {
        systemInstruction: "Respond ONLY with the category name.",
      },
    });
    return response.text?.trim() || "Others";
  } catch {
    return "Others";
  }
};
