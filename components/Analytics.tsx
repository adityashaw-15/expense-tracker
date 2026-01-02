
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, ChartDataPoint, CATEGORY_METALLICS } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transactions: Transaction[];
}

export const Analytics: React.FC<Props> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | '7days' | string>('all');

  const filteredData = useMemo(() => {
    const now = new Date();
    if (filter === 'all') return transactions;
    if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return transactions.filter(t => new Date(t.date) >= sevenDaysAgo);
    }
    return transactions.filter(t => new Date(t.date).getMonth().toString() === filter);
  }, [transactions, filter]);

  const totalForFilter = useMemo(() => 
    filteredData.reduce((acc, t) => acc + t.amount, 0), 
  [filteredData]);

  const categoryData: ChartDataPoint[] = useMemo(() => {
    const data = filteredData.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const velocityData = useMemo(() => {
    const sourceData = filter === 'all' ? transactions : filteredData;
    const sorted = [...sourceData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const result: (ChartDataPoint & { isGap?: boolean; dateStr?: string })[] = [];
    let lastMonth = -1;

    sorted.forEach((t) => {
      const dateObj = new Date(t.date);
      const m = dateObj.getMonth();
      const dateKey = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (lastMonth !== -1 && m !== lastMonth) {
        result.push({ name: `gap-${m}-1`, value: 0, isGap: true });
        result.push({ name: `gap-${m}-2`, value: 0, isGap: true });
      }

      const existing = result.find(item => item.name === dateKey && !item.isGap);
      if (existing) {
        existing.value += t.amount;
      } else {
        result.push({ 
          name: dateKey, 
          value: t.amount, 
          monthIndex: m,
          category: t.category 
        });
      }
      lastMonth = m;
    });

    return result;
  }, [transactions, filteredData, filter]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
        className="glass p-5 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6 shadow-2xl border-white/5 cursor-default transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Time Horizon</span>
            <select 
              className="bg-neutral-900/80 text-white text-xs font-bold px-5 py-2.5 rounded-full border border-white/10 outline-none focus:border-amber-600 transition-all cursor-pointer hover:bg-neutral-800"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Entire Ledger</option>
              <option value="7days">Recent Week</option>
              {months.map((m, i) => (
                <option key={m} value={i.toString()}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[9px] text-amber-600/60 uppercase font-black tracking-[0.3em]">Volume Segment</span>
          <AnimatePresence mode="wait">
            <motion.p 
              key={totalForFilter}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-3xl font-black text-amber-500 tracking-tighter"
            >
              ₹{totalForFilter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="glass p-8 rounded-[3rem] shadow-inner cursor-default"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Asset Allocation</h3>
          </div>
          <div className="h-[280px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_METALLICS[entry.name as keyof typeof CATEGORY_METALLICS]} 
                        className="hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-800 font-bold italic">CHART SILENT</div>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
              {categoryData.map((item) => (
                <motion.div 
                  key={item.name} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_METALLICS[item.name as keyof typeof CATEGORY_METALLICS], boxShadow: `0 0 8px ${CATEGORY_METALLICS[item.name as keyof typeof CATEGORY_METALLICS]}44` }}></div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neutral-500">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </motion.div>
              ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="glass p-8 rounded-[3rem] shadow-inner cursor-default"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Spending Velocity</h3>
          </div>
          <div className="h-[280px] w-full">
            {velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      if (payload.value.startsWith('gap')) return null;
                      return <text x={x} y={y + 15} fill="#444" fontSize={8} textAnchor="middle" fontWeight="black">{payload.value}</text>;
                    }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }}
                    contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fbbf24', fontWeight: '900' }}
                    formatter={(value: number, name: string, props: any) => {
                        if (props.payload.isGap) return [null, null];
                        return [`₹${value.toLocaleString('en-IN')}`, 'Flow'];
                    }}
                    labelStyle={{ color: '#666', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 6, 6]} 
                    barSize={16}
                    animationDuration={1500}
                  >
                    {velocityData.map((entry, index) => (
                       <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isGap ? 'transparent' : (entry.category ? CATEGORY_METALLICS[entry.category] : '#d97706')} 
                        fillOpacity={entry.isGap ? 0 : 0.9}
                       />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-800 font-bold italic">CHART SILENT</div>
            )}
          </div>
          <div className="mt-8 flex justify-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
               <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Live Flux</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-1.5 rounded bg-neutral-800"></div>
               <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Separation</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
