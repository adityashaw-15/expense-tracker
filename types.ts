
export type Category = 
  | 'Food & Dining'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Travel'
  | 'Others';

export type ViewState = 'auth' | 'landing' | 'onboarding' | 'dashboard' | 'profile';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  email?: string;
  picture?: string;
  monthlyIncome: number;
  housingStatus: 'owned' | 'rented';
  // Tactical Targets for AI Baseline
  baselineRent: number;
  baselineGroceries: number;
  baselineUtilities: number;
  setupComplete: boolean;
  isAuthenticated: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  type: 'expense' | 'income';
}

export interface SpendingInsight {
  summary: string;
  recommendations: string[];
  savingOpportunities: string;
  budgetAdherence: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  monthIndex?: number;
  category?: Category;
  [key: string]: string | number | boolean | undefined;
}

export const CATEGORY_METALLICS: Record<Category, string> = {
  'Food & Dining': '#10b981', 
  'Shopping': '#f472b6',      
  'Transport': '#38bdf8',     
  'Bills & Utilities': '#f59e0b', 
  'Entertainment': '#a855f7', 
  'Health': '#fb7185',        
  'Travel': '#fbbf24',        
  'Others': '#94a3b8',        
};
