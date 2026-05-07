/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Zap, 
  ShieldAlert, 
  FileCheck,
  ChevronDown,
  Info
} from 'lucide-react';

interface BenchmarkStats {
  accuracy: number;
  f1Score: number;
  latency: number;
  processed: number;
}

export default function BenchmarkDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeModel, setActiveModel] = useState<'gemini' | 'huggingface' | 'hybrid'>('gemini');

  // Simulation Data
  const benchmarkData = useMemo(() => [
    { name: 'Accuracy', gemini: 91.8, huggingface: 87.2, hybrid: 96.5 },
    { name: 'F1-Score', gemini: 94.2, huggingface: 89.5, hybrid: 97.8 },
    { name: 'Recall', gemini: 95.1, huggingface: 88.3, hybrid: 98.2 },
    { name: 'Precision', gemini: 93.4, huggingface: 90.7, hybrid: 97.4 },
  ], []);

  const timelineData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      batch: i + 1,
      accuracy: 90 + Math.random() * 8,
      latency: 1.5 + Math.random() * 2,
    }));
  }, []);

  const runBenchmark = () => {
    setIsRunning(true);
    setProgress(0);
    // Simulate a 10,000 document run in 3 seconds visually
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const currentStats = useMemo(() => {
    const base = benchmarkData.find(d => d.name === 'Accuracy')?.[activeModel] || 0;
    const f1 = benchmarkData.find(d => d.name === 'F1-Score')?.[activeModel] || 0;
    return {
      accuracy: isRunning ? base - (10 - (progress/10)) : base,
      f1Score: isRunning ? f1 - (10 - (progress/10)) : f1,
      latency: activeModel === 'gemini' ? 2.4 : activeModel === 'huggingface' ? 1.1 : 3.6,
      processed: isRunning ? Math.floor((progress / 100) * 10000) : 10000
    };
  }, [progress, isRunning, activeModel, benchmarkData]);

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-[var(--ink-bright)] flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              Model Performance Benchmark
            </h2>
            <p className="text-xs text-[var(--ink-dim)]">Simulating N=10,000 diversified financial documents</p>
          </div>
          
          <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
            {(['gemini', 'huggingface', 'hybrid'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveModel(m)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeModel === m 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-[var(--ink-dim)] hover:text-[var(--ink)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Avg. Accuracy" 
            value={`${currentStats.accuracy.toFixed(1)}%`} 
            icon={<Target size={16} />}
            color="text-blue-500"
          />
          <StatCard 
            label="F1-Score" 
            value={`${currentStats.f1Score.toFixed(1)}%`} 
            icon={<TrendingUp size={16} />}
            color="text-emerald-500"
          />
          <StatCard 
            label="Avg. Latency" 
            value={`${currentStats.latency}s`} 
            icon={<Zap size={16} />}
            color="text-amber-500"
          />
          <StatCard 
            label="Sample Volume" 
            value={currentStats.processed.toLocaleString()} 
            icon={<FileCheck size={16} />}
            color="text-purple-500"
          />
        </div>

        <button 
          onClick={runBenchmark}
          disabled={isRunning}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
        >
          {isRunning ? (
            <>
              <div 
                className="absolute inset-0 bg-blue-400/20 transition-all duration-100" 
                style={{ width: `${progress}%` }} 
              />
              <span className="relative z-10">Running Performance Audit... {progress}%</span>
            </>
          ) : (
            <>
              <Activity size={16} />
              Initiate Benchmark Simulation (10k)
            </>
          )}
        </button>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 h-[400px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink-dim)] mb-6">Model Comparison Metrics</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey={activeModel} radius={[4, 4, 0, 0]}>
                {benchmarkData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 h-[400px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink-dim)] mb-6">Accuracy Stability Graph</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="batch" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                label={{ value: 'Batch Number', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[80, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none',
                  borderRadius: '8px',
                   fontSize: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorAcc)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interview Insight Card */}
      <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
          <Info className="text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Interview Corner: The "So What?"</h4>
          <p className="text-xs text-[var(--ink-dim)] leading-relaxed">
            In an interview, don't just show these scores. Explain that a **95% F1-score** is great, but the missing 5% could be a high-value $1M invoice. Mention your **Confidence Layer** strategy to flag high-risk documents for manual verification, effectively bridging the gap between AI performance and business requirements.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--line)] p-4 rounded-xl">
      <div className={`flex items-center gap-2 ${color} mb-2`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <div className="text-xl font-mono font-bold text-[var(--ink-bright)]">{value}</div>
    </div>
  );
}
