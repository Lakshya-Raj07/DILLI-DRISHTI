import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radio, RefreshCw, Search, Users, IndianRupee, 
  MapPin, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  ShieldCheck, Activity, Database, LayoutGrid
} from 'lucide-react';

const SupervisorDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeView, setActiveView] = useState('registry'); // 'registry' or 'wards'
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);

  // UPDATED: fetchData now takes a showLoader flag to prevent dashboard "blinking"
  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const workerRes = await axios.get(`http://localhost:5000/api/supervisor/workers?search=${search}&offset=${page * 15}`);
      setWorkers(workerRes.data);
      const statsRes = await axios.get('http://localhost:5000/api/supervisor/stats');
      setStats(statsRes.data);
    } catch (err) { 
      console.error("Sync Error: Mainframe unreachable"); 
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // 1. Triggered on search or page change (With Loader)
  useEffect(() => { 
    fetchData(true); 
  }, [search, page]);

  // 2. INSTRUCTION: Live Polling (Every 5 seconds, Without Loader)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchData(false); // Background update
    }, 5000);

    return () => clearInterval(pollTimer); // Cleanup to prevent memory leaks
  }, [search, page]);

  const triggerAction = async (type, id) => {
    const url = type === 'ping' ? `/api/ping/trigger` : `/api/salary/release`;
    try {
      const res = await axios.post(`http://localhost:5000${url}`, { employee_id: id });
      setStatusMsg({ 
        type: 'success', 
        text: type === 'ping' ? "Signal Transmitted!" : `Payout Authorized. Demo OTP: ${res.data.otp_hint}` 
      });
      fetchData(false); // Refresh data immediately after action
    } catch (err) { 
      setStatusMsg({ type: 'error', text: "Operational Error: Registry Locked" }); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] mcd-bg-pattern flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-72 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-900/20"><Radio size={24} className="animate-pulse" /></div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter">Dilli Drishti</h1><p className="text-[9px] text-blue-300 font-bold uppercase mt-1 tracking-widest">Field Force Command</p></div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveView('registry')} 
            className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all ${activeView === 'registry' ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}
          >
            <Users size={18}/> <span className="text-sm font-bold">Personnel Registry</span>
          </button>
          <button 
            onClick={() => setActiveView('wards')} 
            className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all ${activeView === 'wards' ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}
          >
            <LayoutGrid size={18}/> <span className="text-sm font-bold">Operational Wards</span>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 text-green-400">
          <Activity size={14} className="animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest">Mainframe Active</span>
        </div>
      </aside>

      {/* MISSION CONTROL */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto">
        
        {activeView === 'registry' ? (
          <div className="flex flex-col h-full animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Command Control Grid</h2>
                <div className="flex gap-4 mt-2">
                   <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-100 flex items-center gap-2 shadow-sm"><Users size={12}/> Workforce: {stats?.total_workforce || '...'}</div>
                   <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-orange-100 flex items-center gap-2 shadow-sm"><Radio size={12}/> Active Pings: {stats?.awaiting_response || '0'}</div>
                </div>
              </div>

              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="Identity or Ward Search..." 
                   value={search} 
                   onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
                   className="w-full md:w-80 py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-[#1A2B4C] shadow-sm"
                 />
              </div>
            </header>

            {statusMsg && (
              <div className={`mb-8 p-5 rounded-[24px] border-l-8 shadow-xl flex items-center justify-between animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
                <span className="font-black uppercase text-xs tracking-widest flex items-center gap-3">{statusMsg.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}{statusMsg.text}</span>
                <button onClick={() => setStatusMsg(null)} className="p-2 hover:bg-black/5 rounded-full transition-all">✕</button>
              </div>
            )}

            {/* PERFORMANCE TABLE */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-white overflow-hidden flex-1 relative">
               {/* Show spinner only during manual loads */}
               {loading && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
                   <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}

               <div className="overflow-x-auto h-full overflow-y-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                        <tr>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Personnel Identity</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Operational Ward</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Integrity Index</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {workers.map(worker => (
                          <tr key={worker.id} className="hover:bg-blue-50/50 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group-hover:scale-110 transition-transform"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`} alt="av" /></div>
                                   <div><p className="text-xs font-black text-[#1A2B4C] uppercase">{worker.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: MCD-2026-{worker.id}</p></div>
                                </div>
                             </td>
                             <td className="px-8 py-5"><p className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2"><MapPin size={12} className="text-slate-300" /> {worker.ward_name}</p></td>
                             <td className="px-8 py-5 text-center">
                                <div className="flex flex-col items-center gap-1">
                                   <span className={`text-sm font-black ${parseFloat(worker.integrity_score) < 85 ? 'text-red-600' : 'text-blue-600'}`}>{worker.integrity_score}%</span>
                                   {worker.is_ping_active ? (
                                     <span className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full animate-pulse"><Radio size={8} /> Awaiting Resp</span>
                                   ) : (
                                     <span className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={8}/> Synchronized</span>
                                   )}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right flex justify-end gap-2">
                                <button onClick={() => triggerAction('ping', worker.id)} className="px-5 py-2.5 bg-[#1A2B4C] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-md active:scale-95">Signal Ping</button>
                                <button onClick={() => triggerAction('payout', worker.id)} className="px-5 py-2.5 bg-white border-2 border-slate-100 text-[#1A2B4C] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-95">Authorize Pay</button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* PAGINATION */}
            <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic flex items-center gap-2"><Database size={12}/> Live Registry Polling Active (5s)</div>
               <div className="flex items-center gap-4">
                  <button onClick={() => setPage(Math.max(0, page - 1))} className="p-3 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 disabled:opacity-30" disabled={page === 0}><ChevronLeft size={20}/></button>
                  <span className="text-xs font-black text-[#1A2B4C] uppercase bg-slate-100 px-4 py-2 rounded-xl">Batch {page + 1}</span>
                  <button onClick={() => setPage(page + 1)} className="p-3 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 disabled:opacity-30" disabled={workers.length < 15}><ChevronRight size={20}/></button>
               </div>
            </div>
          </div>
        ) : (
          /* Operational Wards View */
          <div className="flex flex-col h-full animate-fade-in">
             <header className="mb-10"><h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Zonal Surveillance Hub</h2></header>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['Ward 54 - Rohini', 'Ward 12 - Lajpat Nagar', 'Ward 05 - Civil Lines', 'Ward 22 - Dwarka', 'Ward 09 - Karol Bagh'].map(w => (
                  <div key={w} className="bg-white p-8 rounded-[40px] shadow-xl border border-white group hover:border-blue-500 transition-all cursor-pointer">
                     <div className="flex justify-between items-start mb-6">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><MapPin size={24} /></div>
                        <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded-full uppercase">Secure Zone</span>
                     </div>
                     <h3 className="font-black text-[#1A2B4C] uppercase text-lg mb-4">{w}</h3>
                     <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Staff: 1,200+</span>
                        <span className="text-blue-600">Enter Hub ➔</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SupervisorDashboard;