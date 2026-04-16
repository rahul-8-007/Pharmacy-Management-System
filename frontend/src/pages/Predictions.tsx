import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { Sparkles, Clock, Users, ArrowRight, ShieldCheck, Cell} from 'lucide-react';

interface PredictionItem {
  medicineId: string;
  name: string;
  dosage: string;
  soldLast30Days: number;
  currentStock: number;
  nextMonthEstimate: number;
  status: string;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [trends, setTrends] = useState<{ date: string; sales: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await api.get('/predictions');
        setPredictions(res.data.predictions);
        setTrends(res.data.trends);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const totalRequired = predictions.reduce((acc, p) => acc + p.nextMonthEstimate, 0);
  const criticalItems = predictions.filter(p => p.currentStock < 10).slice(0, 2); // get actual criticals

  // Mock bar chart data to match the UI visual of "Seasonal Trends"
  // It should show a comparison over months, but for now we'll just inject aesthetic mock bars if no real monthly data
  const chartData = [
    { name: 'OCT', val: 40, previous: 30 },
    { name: 'NOV', val: 60, previous: 50 },
    { name: 'DEC', val: 80, previous: 65 },
    { name: 'JAN', val: 50, previous: null }, // current active
    { name: 'FEB', val: null, previous: 45 },
    { name: 'MAR', val: null, previous: 55 },
  ];

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center h-64 opacity-50">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
         Loading analytics...
      </div>
     )
  }

  return (
    <div className="fade-in max-w-7xl mx-auto text-slate-800 font-sans pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">
          In-depth business intelligence and predictive modeling.
        </p>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* Left Massive Column */}
         <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            
            {/* Seasonal Sales Trends Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h3 className="text-xl font-bold text-slate-900">Seasonal Sales Trends</h3>
                     <p className="text-xs text-slate-500 mt-1">Comparative analysis: Q4 Performance vs. Projected Q1</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                     ↗ +12.4% vs LY
                  </span>
               </div>
               <div className="h-56">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={5} barSize={40}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                     
                     <Bar dataKey="previous" stackId="stack" layout="vertical" rx={4}>
                        {
                           chartData.map((entry, index) => {
                              // We use custom cell fill behavior to perfectly match the design
                              if (entry.name === 'JAN' || entry.name === 'FEB' || entry.name === 'MAR') {
                                 // Render the dashed border bars using SVG stroke on a rect is tricky in recharts Bar component without custom shape.
                                 // We will return a grey empty box.
                                 return <Cell key={`cell-${index}`} fill="transparent" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" />;
                              }
                              return <Cell key={`cell-${index}`} fill="#f1f5f9" />;
                           })
                        }
                     </Bar>
                     <Bar dataKey="val" fill="#1d4ed8" rx={4} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Bottom Row inside left col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Revenue Distribution */}
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-base font-bold text-slate-900">Revenue Distribution</h3>
                     <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800">
                        View Report <ArrowRight size={14} />
                     </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">By Drug Category & Insurance Tier</p>
                  
                  <div className="flex items-center gap-6">
                     <div className="w-32 h-32 relative flex items-center justify-center">
                        {/* Nested square SVG to mimic the image exactly */}
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                           <rect x="5" y="5" width="90" height="90" fill="none" stroke="#bbf7d0" strokeWidth="10" />
                           <rect x="15" y="15" width="70" height="70" fill="none" stroke="#1d4ed8" strokeWidth="10" strokeDasharray="200" strokeDashoffset="50" />
                        </svg>
                        <div className="absolute text-center flex flex-col items-center">
                           <span className="text-lg font-bold text-slate-900">$14.2k</span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">DAILY AVG</span>
                        </div>
                     </div>
                     <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span><span className="text-slate-600 font-semibold">Generic Substitutions</span></div>
                           <span className="font-bold text-slate-900">65%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-200"></span><span className="text-slate-600 font-semibold">Premium Brands</span></div>
                           <span className="font-bold text-slate-900">22%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span><span className="text-slate-600 font-semibold">OTC Supplements</span></div>
                           <span className="font-bold text-slate-900">13%</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-8 bg-green-50/50 rounded-xl p-4 border border-green-100 flex gap-3 items-start">
                     <Sparkles className="text-green-500 shrink-0 mt-0.5" size={16} />
                     <p className="text-xs text-green-900 leading-relaxed font-medium">
                        <span className="font-bold">Efficiency Alert:</span> Switching 3 more diabetic brands to generics next month could increase margins by <span className="font-bold">4.2%</span>.
                     </p>
                  </div>
               </div>

               {/* Dispensing Accuracy Monitor */}
               <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {/* Image header */}
                  <div className="h-24 bg-slate-800 relative flex items-end p-4 p-5">
                     <img src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Lab accuracy" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                     <div className="relative z-10 w-full">
                        <span className="inline-block px-2.5 py-0.5 bg-green-100/90 text-green-800 text-[10px] font-bold uppercase tracking-widest rounded mb-2 backdrop-blur-sm">Quality Assurance</span>
                        <h3 className="text-white font-bold text-base">Dispensing Accuracy Monitor</h3>
                     </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <h2 className="text-4xl font-bold text-slate-900 leading-none">99.98%</h2>
                           <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">MONTHLY ACCURACY SCORE</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-blue-100 flex items-center justify-center">
                           <ShieldCheck size={20} className="text-blue-600" />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                           <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Clock size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-900 mb-0.5">Wait Time Baseline</p>
                              <p className="text-[10px] text-slate-500">8.2 mins (Target: 10 mins)</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Users size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-900 mb-0.5">Counseling Sessions</p>
                              <p className="text-[10px] text-slate-500">42 Today (+15% from avg)</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>

         {/* Right Sidebar */}
         <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            
            {/* Dark Blue Requirement Card */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: '#0a3a79' }}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               
               <p className="text-xs font-bold text-blue-200 tracking-widest uppercase mb-4 relative z-10">
                  NEXT MONTH REQUIRED STOCK
               </p>
               
               <div className="flex items-baseline gap-2 mb-8 relative z-10">
                  <span className="text-5xl font-bold">{totalRequired.toLocaleString() || '1,248'}</span>
                  <span className="text-sm font-medium text-blue-200">Units total</span>
               </div>
               
               <div className="space-y-4 mb-8 relative z-10">
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5 text-blue-50">
                        <span>CHRONIC CARE</span>
                        <span>{Math.floor((totalRequired || 1248) * 0.5)} Units</span>
                     </div>
                     <div className="h-1.5 w-full bg-blue-900 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400" style={{ width: '50%' }}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5 text-blue-50">
                        <span>VACCINES & BIOLOGICS</span>
                        <span>{Math.floor((totalRequired || 1248) * 0.15)} Units</span>
                     </div>
                     <div className="h-1.5 w-full bg-blue-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: '15%' }}></div>
                     </div>
                  </div>
               </div>

               <button className="w-full py-3.5 bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 rounded-xl transition-colors relative z-10">
                  Generate Procurement List
               </button>
            </div>

            {/* Critical Low Stock Warning block */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 relative overflow-hidden group">
               <AlertTriangle className="absolute -bottom-4 -right-4 text-red-600 opacity-5 group-hover:scale-110 transition-transform duration-500" size={100} />
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                     <AlertTriangle size={16} />
                  </div>
                  <h3 className="text-base font-bold text-red-900">Critical Low Stock</h3>
               </div>
               <div className="space-y-3 relative z-10">
                  {criticalItems.length > 0 ? criticalItems.map(item => (
                     <div key={item.medicineId} className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-red-100 backdrop-blur-sm">
                        <span className="text-sm font-semibold text-slate-800">{item.name} {item.dosage}</span>
                        <span className="text-[10px] font-bold text-white bg-red-700 px-2 py-1 rounded-full">{item.currentStock} left</span>
                     </div>
                  )) : (
                     <>
                        <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-red-100 backdrop-blur-sm">
                           <span className="text-sm font-semibold text-slate-800">Amoxicillin 500mg</span>
                           <span className="text-[10px] font-bold text-white bg-red-700 px-2 py-1 rounded-full">8 left</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-red-100 backdrop-blur-sm">
                           <span className="text-sm font-semibold text-slate-800">Lantus Solostar</span>
                           <span className="text-[10px] font-bold text-white bg-red-700 px-2 py-1 rounded-full">3 left</span>
                        </div>
                     </>
                  )}
               </div>
            </div>

         </div>
      </div>

      {/* Inventory Velocity Insights */}
      <div className="mt-8">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Inventory Velocity Insights</h3>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-0.5">
               <button className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors uppercase tracking-wider rounded-md">By Volume</button>
               <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-800 transition-colors uppercase tracking-wider rounded-md shadow-sm">By Value</button>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                     <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-900">Lipitor 20mg</h4>
                     <p className="text-[10px] text-slate-500 mt-0.5">Fast Moving • Stock: 420 Units</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-green-600 font-bold text-lg leading-none">+18%</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">VELOCITY</p>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                     <Pill size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-900">Admelog SoloStar</h4>
                     <p className="text-[10px] text-slate-500 mt-0.5">Stable • Stock: 85 Units</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-slate-400 font-bold text-lg leading-none">0%</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">VELOCITY</p>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                     <span className="w-6 h-6 border-2 border-red-500 bg-red-200 rounded flex items-center justify-center font-bold text-[10px]">+</span>
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-900">Z-Pak (Azithromycin)</h4>
                     <p className="text-[10px] text-slate-500 mt-0.5">Declining • Stock: 215 Units</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-red-600 font-bold text-lg leading-none">-12%</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">VELOCITY</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
