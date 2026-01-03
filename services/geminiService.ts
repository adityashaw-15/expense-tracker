
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SpendingInsight, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (
  transactions: Transaction[], 
  profile: UserProfile
): Promise<SpendingInsight> => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const currentMonthData = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  const lastMonthData = transactions.filter(t => new Date(t.date).getMonth() === lastMonth);

  const getCatTotals = (txs: Transaction[]) => txs.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const currentTotals = getCatTotals(currentMonthData);
  const lastTotals = getCatTotals(lastMonthData);

  const comparisonString = Object.keys(currentTotals).map(cat => {
    const curr = currentTotals[cat] || 0;
    const prev = lastTotals[cat] || 0;
    if (prev > 0) {
      const diff = curr - prev;
      return `${cat}: Last Month ₹${prev}, This Month ₹${curr} (${diff > 0 ? 'INCREASED' : 'DECREASED'} by ₹${Math.abs(diff)})`;
    }
    return `${cat}: This Month ₹${curr}`;
  }).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        USER PROFILE:
        Income: ₹${profile.monthlyIncome} per month
        Housing: ${profile.housingStatus === 'rented' ? 'Renting (has monthly rent burden)' : 'Owns house (no rent)'}
        
        USER-DEFINED TACTICAL TARGETS (MONTHLY):
        - Rent/Mortgage Target: ₹${profile.baselineRent}
        - Grocery Target: ₹${profile.baselineGroceries}
        - Utilities Target: ₹${profile.baselineUtilities}
        
        MONTH-OVER-MONTH ACTUAL ANALYSIS:
        ${comparisonString}
        
        TOTAL TRANSACTIONS LOGGED:
        ${transactions.map(t => `${t.date}: ${t.description} (${t.category}) - ₹${t.amount}`).join('\n')}
      `,
      config: {
        systemInstruction: `You are an elite Indian Financial Strategist. 
        Compare actual spending against the USER-DEFINED TACTICAL TARGETS.
        
        STRICT RULES:
        1. Explicitly mention if their actual Rent/Utilities/Groceries exceeded their targets.
        2. Calculate a 'Budget Adherence Score' based on how close they are to their targets.
        3. Suggest specific cuts if they are >10% over their grocery target.
        4. Be direct and professional.
        
        Format the response in pure JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            savingOpportunities: { type: Type.STRING },
            budgetAdherence: { type: Type.NUMBER }
          },
          required: ["summary", "recommendations", "savingOpportunities", "budgetAdherence"]
        },
      },
    });

    return JSON.parse(response.text || '{}') as SpendingInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Analysis engine encountered an error.",
      recommendations: ["Ensure your API key is valid.", "Check internet connection."],
      savingOpportunities: "Retry in a few moments.",
      budgetAdherence: 50
    };
  }
};

export const suggestCategory = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Description: "${description}". Select category: Food & Dining, Shopping, Transport, Bills & Utilities, Entertainment, Health, Travel, Others.`,
      config: { systemInstruction: "Respond with Category name ONLY." },
    });
    return response.text?.trim() || "Others";
  } catch {
    return "Others";
  }
};
