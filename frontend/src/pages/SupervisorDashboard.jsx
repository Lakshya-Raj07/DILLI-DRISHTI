import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radio, RefreshCw, Search, Users, IndianRupee, 
  MapPin, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  ShieldCheck, Activity
} from 'lucide-react';

const SupervisorDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/supervisor/workers?search=${search}&offset=${page * 15}`);
      setWorkers(res.data);
    } catch (err) {
      console.error("Registry Error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchWorkers(); }, [search, page]);

  const triggerPing = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/ping/trigger', { employee_id: id });
      setStatusMsg({ type: 'success', text: "Verification Signal Transmitted!" });
      fetchWorkers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Signal Blocked" });
    }
  };

  const releaseSalary = async (id) => {
    try {
      const res = await axios.post('http://localhost:5000/api/salary/release', { employee_id: id });
      setStatusMsg({ type: 'success', text: `Authorized. Security OTP: ${res.data.otp_hint}` });
      fetchWorkers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Payment Auth Failed" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <aside className="w-full lg:w-72 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Dilli Drishti</h1>
            <p className="text-[9px] text-blue-300 font-bold uppercase mt-1">Command Hub v5.5</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-blue-600 text-white shadow-xl transition-all">
            <Users size={18}/> <span className="text-sm font-bold">Field Force Registry</span>
          </button>
          <div className="p-4 text-blue-200/40 text-[10px] font-bold uppercase tracking-widest mt-8">Operations</div>
          <button className="w-full flex items-center gap-4 p-4 rounded-[20px] text-blue-200/50 hover:bg-white/5 transition-all">
            <MapPin size={18}/> <span className="text-sm font-bold">Live Wards</span>
          </button>
        </nav>

        <div className="mt-auto bg-white/5 p-4 rounded-2xl border border-white/10">
           <div className="flex items-center gap-3 text-green-400">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase">Mainframe Active</span>
           </div>
        </div>
      </aside>

      {/* 2. MAIN CONTROL PANEL */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
             <h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Personnel Command Grid</h2>
             <p className="text-slate-400 font-medium text-sm mt-1 flex items-center gap-2">
               <ShieldCheck size={16} className="text-blue-500" /> Scalable Monitoring: 150,000+ Records Context Enabled
             </p>
          </div>

          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Search Identity or Ward..." 
               value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(0); }}
               className="w-full md:w-80 py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-[#1A2B4C] shadow-sm"
             />
          </div>
        </header>

        {statusMsg && (
          <div className={`mb-8 p-5 rounded-[24px] border-l-8 shadow-xl flex items-center justify-between animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
            <span className="font-black uppercase text-xs tracking-widest flex items-center gap-3">
              {statusMsg.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
              {statusMsg.text}
            </span>
            <button onClick={() => setStatusMsg(null)} className="font-bold p-2 hover:bg-black/5 rounded-full transition-all">✕</button>
          </div>
        )}

        {/* --- PERFORMANCE-OPTIMIZED COMMAND TABLE --- */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-white overflow-hidden flex-1">
           <div className="overflow-x-auto h-full overflow-y-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Identity</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Ward</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrity Index</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Command Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {workers.map(worker => (
                      <tr key={worker.id} className="hover:bg-blue-50/50 transition-colors group">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`} alt="av" />
                               </div>
                               <div>
                                 <p className="text-xs font-black text-[#1A2B4C] uppercase">{worker.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: MCD-{worker.id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2">
                               <MapPin size={12} className="text-slate-300" /> {worker.ward_name}
                            </p>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <span className={`text-sm font-black ${parseFloat(worker.integrity_score) < 90 ? 'text-red-600' : 'text-blue-600'}`}>
                                 {worker.integrity_score}%
                               </span>
                               {worker.is_ping_active && (
                                 <span className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                                   <Radio size={8} /> Awaiting Resp
                                 </span>
                               )}
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex gap-2">
                               <button onClick={() => triggerPing(worker.id)} className="px-5 py-2.5 bg-[#1A2B4C] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-md active:scale-90">Signal Ping</button>
                               <button onClick={() => releaseSalary(worker.id)} className="px-5 py-2.5 bg-white border-2 border-slate-100 text-[#1A2B4C] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-90">Authorize Pay</button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* --- PAGINATION (BATCH CONTROL) --- */}
        <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              Showing batch of 15 • Dynamic Load Enabled
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))}
                className="p-3 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                disabled={page === 0}
              >
                <ChevronLeft size={20}/>
              </button>
              <span className="text-xs font-black text-[#1A2B4C] uppercase bg-slate-100 px-4 py-2 rounded-xl">Context: Batch {page + 1}</span>
              <button 
                onClick={() => setPage(page + 1)}
                className="p-3 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                disabled={workers.length < 15}
              >
                <ChevronRight size={20}/>
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;