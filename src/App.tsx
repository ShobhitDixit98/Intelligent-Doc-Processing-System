/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Database, 
  ShieldCheck, 
  Download,
  Terminal,
  Cpu,
  Camera,
  X,
  Sun,
  Moon,
  TrendingUp
} from 'lucide-react';
import { processDocument, ExtractedData } from './lib/gemini';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ProcessStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ProcessedFile {
  id: string;
  file: File;
  status: ProcessStatus;
  result?: ExtractedData;
  error?: string;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [activeView, setActiveView] = useState<'pipeline' | 'benchmarks'>('pipeline');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'idle' as const,
    }));
    setProcessedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  } as any);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setProcessedFiles(prev => [...prev, {
              id: Math.random().toString(36).substring(7),
              file,
              status: 'idle'
            }]);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const processFile = async (item: ProcessedFile) => {
    setProcessedFiles(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing' } : p));
    
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(item.file);
      });

      const result = await processDocument(base64, item.file.type);
      setProcessedFiles(prev => prev.map(p => p.id === item.id ? { ...p, status: 'completed', result } : p));
      return result;
    } catch (err) {
      console.error(err);
      setProcessedFiles(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: 'Extraction failed' } : p));
      return null;
    }
  };

  const processAll = async () => {
    setIsProcessing(true);
    const idleFiles = processedFiles.filter(f => f.status === 'idle');
    
    for (const fileItem of idleFiles) {
      await processFile(fileItem);
    }
    
    setIsProcessing(false);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const exportCSV = () => {
    const completed = processedFiles.filter(f => f.status === 'completed' && f.result);
    if (completed.length === 0) return;

    const headers = ['Date', 'Time', 'Type', 'Description', 'Vendor', 'Total', 'Currency', 'Category', 'Tax'];
    const rows = completed.map(f => {
      const e = f.result!.entities;
      return [
        e.date || '',
        e.time || '',
        f.result!.documentType,
        (e.description || '').replace(/,/g, ';'), 
        (e.vendorName || '').replace(/,/g, ';'),
        e.totalAmount || 0,
        e.currency || '',
        e.category || '',
        e.taxAmount || 0
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `idp_system_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadNotebook = () => {
    const link = document.createElement('a');
    link.href = '/IDP_Notebook.ipynb';
    link.download = 'IDP_Intelligent_Document_Processing.ipynb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = processedFiles.filter(f => f.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* Header */}
      <header className="h-20 border-b border-[var(--line)] bg-[var(--panel)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="font-semibold text-xl tracking-tight text-[var(--ink-bright)] flex items-center gap-2">
                Intelligent Document Processing System
                <span className="text-blue-500 text-[10px] font-mono border border-blue-500/30 px-1.5 rounded bg-blue-500/5">v1.0.0</span>
              </h1>
              <p className="text-[10px] font-mono uppercase text-[var(--ink-dim)] tracking-[0.2em] leading-none mt-1">Unified Extraction Engine</p>
            </div>
          </div>
          <nav className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">Processed</p>
                <p className="text-sm font-mono text-[var(--success)]">{completedCount} / {processedFiles.length}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView(activeView === 'pipeline' ? 'benchmarks' : 'pipeline')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
                activeView === 'benchmarks' 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                  : "bg-[var(--card)] border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink-bright)]"
              )}
            >
              <TrendingUp size={12} />
              {activeView === 'pipeline' ? 'Show Analytics' : 'Back to Ledger'}
            </button>

            <div className="h-8 w-[1px] bg-[var(--line)]" />
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--ink-bright)] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={handleDownloadNotebook}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--ink-dim)] hover:text-[var(--ink-bright)] transition-colors"
            >
              <Download size={14} />
              Notebook
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Control */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6 shadow-xl transition-colors">
              <h2 className="text-[10px] font-bold uppercase text-[var(--ink-dim)] tracking-widest mb-6 flex items-center gap-2">
                <Terminal size={14} />
                Input Source
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border border-dashed rounded-xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group",
                    isDragActive ? "border-blue-500 bg-blue-500/5" : "border-[var(--line)] hover:border-[var(--accent)] bg-[var(--bg)]"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload size={20} className="text-[var(--ink-dim)] group-hover:text-[var(--accent)] transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">Files</span>
                </div>
                
                <button 
                  onClick={startCamera}
                  className="border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--bg)] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all group"
                >
                  <Camera size={20} className="text-[var(--ink-dim)] group-hover:text-[var(--accent)] transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">Camera</span>
                </button>
              </div>

              {processedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {processedFiles.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px]">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={12} className="text-[var(--ink-dim)] shrink-0" />
                          <span className="truncate text-[var(--ink)]">{item.file.name}</span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {item.status === 'processing' && <Loader2 size={12} className="text-[var(--accent)] animate-spin" />}
                          {item.status === 'completed' && <CheckCircle2 size={12} className="text-[var(--success)]" />}
                          {item.status === 'error' && <AlertCircle size={12} className="text-red-500" />}
                          {item.status === 'idle' && <span className="w-2 h-2 rounded-full bg-[var(--line)]" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setProcessedFiles([])}
                      className="flex-1 py-3 bg-[var(--card)] hover:bg-[var(--line)] text-[var(--ink)] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors border border-[var(--line)]"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={processAll}
                      disabled={isProcessing || !processedFiles.some(f => f.status === 'idle')}
                      className="flex-[2] py-3 bg-[var(--accent)] disabled:opacity-30 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      {isProcessing ? 'Processing...' : 'Run Pipeline'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6 transition-colors font-sans">
              <h2 className="text-[10px] font-bold uppercase text-[var(--ink-dim)] tracking-widest mb-4">Export Status</h2>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between py-1 border-b border-[var(--line)]">
                   <span className="text-[var(--ink-dim)]">Ready for CSV</span>
                   <span className="text-[var(--success)]">{completedCount} Rows</span>
                </div>
              </div>
              {completedCount > 0 && (
                <button 
                  onClick={exportCSV}
                  className="w-full mt-4 py-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download CSV
                </button>
              )}
            </div>
          </aside>

          {/* Right Column: Interaction Layer */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeView === 'benchmarks' ? (
                <motion.div
                  key="benchmarks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <BenchmarkDashboard />
                </motion.div>
              ) : isCameraOpen ? (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xl relative aspect-video"
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute inset-x-0 bottom-8 flex justify-center items-center gap-6">
                    <button 
                      onClick={stopCamera}
                      className="w-12 h-12 bg-[var(--bg)]/80 backdrop-blur border border-[var(--line)] rounded-full flex items-center justify-center text-[var(--ink)] hover:text-[var(--ink-bright)] transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-slate-300/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-black/10" />
                    </button>
                  </div>
                  
                  <div className="absolute top-6 left-6">
                    <div className="px-3 py-1.5 bg-blue-600/20 backdrop-blur border border-blue-500/30 rounded text-[10px] font-mono text-blue-400 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       CAMERA_READY: ENV_OVERRIDE
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-12rem)] transition-colors"
                >
                  <div className="px-6 py-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--bg)]">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink-bright)]">Interactive Ledger Output</h3>
                      <p className="text-[10px] text-[var(--ink-dim)] mt-0.5">Real-time neural extraction stream</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">LIVE_SYNC</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto custom-scrollbar">
                    {processedFiles.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[var(--ink-dim)] p-12">
                        <Database size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Batch queue empty. Load images, PDFs or use camera.</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-left text-[11px] font-mono">
                        <thead className="sticky top-0 bg-[var(--card)] z-10">
                          <tr className="border-b border-[var(--line)]">
                            <th className="p-4 text-[var(--ink-dim)] font-bold uppercase tracking-wider">Date/Time</th>
                            <th className="p-4 text-[var(--ink-dim)] font-bold uppercase tracking-wider">Merchant/Category</th>
                            <th className="p-4 text-[var(--ink-dim)] font-bold uppercase tracking-wider">Description</th>
                            <th className="p-4 text-[var(--ink-dim)] font-bold uppercase tracking-wider text-right">Total</th>
                            <th className="p-4 text-[var(--ink-dim)] font-bold uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--line)]/50">
                          {processedFiles.map((f) => (
                            <tr key={f.id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                              <td className="p-4">
                                <div className="text-[var(--ink)]">{f.result?.entities.date || '--'}</div>
                                <div className="text-[var(--ink-dim)] text-[9px]">{f.result?.entities.time || '--'}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-[var(--ink-bright)] font-semibold truncate max-w-[150px]">{f.result?.entities.vendorName || '--'}</div>
                                <div className="text-blue-500 text-[9px] uppercase tracking-wider">
                                  {f.result?.entities.category || 'PENDING'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-[var(--ink-dim)] italic line-clamp-2 max-w-[200px]">
                                  {f.result?.entities.description || f.file.name}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="text-[var(--success)] font-bold text-sm">
                                  {f.result ? `${f.result.entities.currency || '$'} ${f.result.entities.totalAmount?.toLocaleString()}` : '--'}
                                </div>
                                <div className="text-[9px] text-[var(--ink-dim)]">TAX: {f.result?.entities.taxAmount || '0.00'}</div>
                              </td>
                              <td className="p-4 text-center">
                                {f.status === 'processing' && <Loader2 size={14} className="mx-auto text-[var(--accent)] animate-spin" />}
                                {f.status === 'completed' && (
                                  <div className="flex flex-col items-center">
                                    <CheckCircle2 size={14} className="text-[var(--success)]" />
                                    <span className="text-[8px] text-[var(--success)] font-bold mt-1">{(f.result!.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                )}
                                {f.status === 'error' && <AlertCircle size={14} className="mx-auto text-red-500" />}
                                {f.status === 'idle' && <span className="text-[var(--ink-dim)]">IDLE</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="h-10 bg-[var(--panel)] border-t border-[var(--line)] px-6 fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between text-[10px] text-[var(--ink-dim)] font-mono transition-colors">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> 
            CORE_LOAD: {isProcessing ? 'HIGH' : 'IDLE'}
          </span>
          <span className="flex items-center gap-2">BATCH_SIZE: {processedFiles.length}</span>
        </div>
        <div className="flex items-center gap-8 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            SESSION_BUFFER: <span className="text-[var(--ink-bright)]">Active</span>
          </span>
          <span className="text-blue-500 font-bold flex items-center gap-2">
            <ShieldCheck size={10} />
            CSV Ready
          </span>
        </div>
      </footer>
      <div className="h-10" />
    </div>
  );
}
