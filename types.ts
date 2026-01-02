
export type Category = 
  | 'Food & Dining'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Travel'
  | 'Others';

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
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: Category;
  monthIndex?: number;
  [key: string]: any;
}

export const CATEGORY_METALLICS: Record<Category, string> = {
  'Food & Dining': '#10b981', // Emerald Metallic
  'Shopping': '#f472b6',      // Rose Quartz
  'Transport': '#38bdf8',     // Azure Platinum
  'Bills & Utilities': '#f59e0b', // Amber Bronze
  'Entertainment': '#a855f7', // Royal Amethyst
  'Health': '#fb7185',        // Crimson Copper
  'Travel': '#fbbf24',        // Golden Sand
  'Others': '#94a3b8',        // Titanium Grey
};
