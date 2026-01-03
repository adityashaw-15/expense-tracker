
import React, { useState } from 'react';
import { Category, Transaction, CATEGORY_METALLICS } from '../types';
import { suggestCategory } from '../services/geminiService';
import { motion } from 'framer-motion';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES: Category[] = [
  'Food & Dining', 'Shopping', 'Transport', 'Bills & Utilities', 
  'Entertainment', 'Health', 'Travel', 'Others'
];

export const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Others');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      date,
      type: 'expense'
    });

    setAmount('');
    setDescription('');
    setCategory('Others');
  };

  const handleBlurDescription = async () => {
    if (!description || description.length < 3) return;
    setIsSuggesting(true);
    const suggestion = await suggestCategory(description);
    if (CATEGORIES.includes(suggestion as Category)) {
      setCategory(suggestion as Category);
    }
    setIsSuggesting(false);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="glass p-8 rounded-[3.5rem] relative overflow-hidden group border border-black/5 dark:border-white/5"
    >
      <div className="absolute top-0 left-0 w-1 h-full transition-colors duration-500" style={{ backgroundColor: CATEGORY_METALLICS[category] }}></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-amber-500 transition-transform group-hover:rotate-12">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <div>
           <h3 className="text-lg font-black tracking-tight text-black dark:text-white uppercase italic leading-none">Input Flux</h3>
           <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">New Record</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Detail</label>
          <input
            type="text"
            className="w-full px-5 py-4 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-amber-600/50 outline-none font-medium text-sm transition-colors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlurDescription}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Volume (₹)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-5 py-4 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-amber-600/50 outline-none font-mono font-black text-lg transition-colors"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
            Classification 
            {isSuggesting && <span className="text-amber-500 animate-pulse lowercase italic">Analysis...</span>}
          </label>
          <select
            className="w-full px-5 py-4 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-amber-600/50 outline-none appearance-none cursor-pointer font-bold text-xs transition-colors"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            style={{ color: CATEGORY_METALLICS[category] }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-white dark:bg-black">{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Date</label>
          <input
            type="date"
            className="w-full px-5 py-4 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus:border-amber-600/50 outline-none cursor-pointer font-bold text-xs transition-colors"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full mt-10 gold-gradient text-black font-black py-4.5 rounded-[2rem] shadow-xl uppercase tracking-widest text-[11px] italic transition-transform"
      >
        Commit Flux
      </motion.button>
    </motion.form>
  );
};
