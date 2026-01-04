import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, IndianRupee, Activity, RefreshCw, 
  AlertTriangle, ShieldAlert, BarChart3, MapPin, 
  Globe, Bell, Search, Zap, CheckCircle 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Icons Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CommissionerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('monitoring'); // Tab state
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/check-db');
      setWorkers(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) { 
      console.error("Database Error:", err); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- DYNAMIC CALCULATIONS ---
  const totalPersonnel = workers.length;
  const avgIntegrity = totalPersonnel > 0 
    ? (workers.reduce((acc, curr) => acc + parseFloat(curr.integrity_score), 0) / totalPersonnel).toFixed(2) 
    : "0.00";
  const criticalWorkers = workers.filter(w => parseFloat(w.integrity_score) < 90);
  const criticalCount = criticalWorkers.length;

  // Chart Data for Analytics Tab
  const integrityHistory = [
    { day: 'Mon', score: 96.5 }, { day: 'Tue', score: 97.2 }, { day: 'Wed', score: 95.8 },
    { day: 'Thu', score: 98.4 }, { day: 'Fri', score: 97.9 }, { day: 'Sat', score: 98.2 }, { day: 'Sun', score: 98.4 },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] mcd-bg-pattern flex flex-col lg:flex-row font-sans">
      
      {/* 1. SIDE NAVIGATION (Now Functional) */}
      <aside className="w-full lg:w-72 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-900/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Dilli Drishti</h1>
            <p className="text-[9px] text-blue-300 font-bold tracking-[0.2em] mt-1">HRMS Control Center</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('monitoring')} className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 ${activeTab === 'monitoring' ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}>
            <Globe size={18}/> <span className="text-sm font-bold">Live Monitoring</span>
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}>
            <BarChart3 size={18}/> <span className="text-sm font-bold">Integrity Analytics</span>
          </button>
          <button onClick={() => setActiveTab('roster')} className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 ${activeTab === 'roster' ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}>
            <Users size={18}/> <span className="text-sm font-bold">Deployment Roster</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Security Status</p>
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Audit Engine Active
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
              <MapPin size={14} className="text-orange-500" /> Administrative HQ • Delhi
            </div>
            <h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Strategic Control Room</h2>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[24px] shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center">
                <Bell size={20} className="text-slate-600" />
             </div>
             <div>
                <p className="text-xs font-black text-[#1A2B4C] uppercase leading-none">Commissioner</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Last Sync: {lastUpdated}</p>
             </div>
             <button onClick={fetchData} className="ml-4 p-2 bg-[#1A2B4C] text-white rounded-xl hover:bg-blue-900 transition-all shadow-md active:scale-90">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {/* 3. DYNAMIC KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Personnel Strength" value={totalPersonnel} sub="Total Field Workforce" icon={<Users />} color="blue" />
          <StatCard title="Avg Integrity" value={`${avgIntegrity}%`} sub="Overall Trust Index" icon={<ShieldCheck />} color="green" />
          <StatCard title="Critical Alerts" value={criticalCount} sub="Anomalies Detected" icon={<AlertTriangle />} color="red" isAlert={criticalCount > 0} />
          <StatCard title="Payroll Status" value="Encrypted" sub="Tamper-proof Ledger" icon={<IndianRupee />} color="orange" />
        </div>

        {/* 4. TAB CONTENT SWITCHER */}
        
        {/* TAB: Monitoring (Map view) */}
        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 bg-white rounded-[40px] p-2 shadow-xl border border-white h-[500px] relative overflow-hidden">
              <div className="absolute top-6 left-6 z-[1000] bg-[#1A2B4C]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-green-400 animate-pulse" /> Live Ward Distribution
              </div>
              <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full rounded-[38px]">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {workers.map(worker => (
                  worker.lat && worker.lng && (
                    <React.Fragment key={worker.id}>
                      <Circle center={[parseFloat(worker.lat), parseFloat(worker.lng)]} radius={400} pathOptions={{ color: parseFloat(worker.integrity_score) < 90 ? '#EF4444' : '#1A2B4C', fillColor: parseFloat(worker.integrity_score) < 90 ? '#EF4444' : '#3b82f6', fillOpacity: 0.1 }} />
                      <Marker position={[parseFloat(worker.lat), parseFloat(worker.lng)]}>
                        <Popup>
                          <div className="p-2">
                            <p className="font-black text-[#1A2B4C] uppercase text-xs">{worker.name}</p>
                            <p className="text-slate-400 font-bold text-[9px] uppercase">{worker.ward_name}</p>
                            <div className="mt-2 text-xs font-black text-blue-600">Integrity: {worker.integrity_score}%</div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  )
                ))}
              </MapContainer>
            </div>
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white flex flex-col h-[500px]">
              <h3 className="text-sm font-black text-[#1A2B4C] uppercase mb-6 flex items-center gap-2"><Zap size={18} className="text-orange-500" /> Active Alerts</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {criticalWorkers.map(worker => (
                  <div key={worker.id} className="bg-red-50 border border-red-100 p-4 rounded-[24px] hover:bg-red-100 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#1A2B4C] font-black text-xs uppercase">{worker.name}</p>
                        <p className="text-red-800/60 font-bold text-[10px] uppercase">{worker.ward_name}</p>
                      </div>
                      <span className="bg-white px-2 py-1 rounded-lg text-red-600 font-black text-xs shadow-sm">{worker.integrity_score}%</span>
                    </div>
                    <button className="mt-3 w-full py-2 bg-white text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-200 hover:bg-red-600 hover:text-white transition-all">Execute Random Ping</button>
                  </div>
                ))}
                {criticalCount === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                    <CheckCircle size={48} className="text-green-500 mb-4" />
                    <p className="text-xs font-black text-slate-500 uppercase">System Secure</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white">
                <h3 className="text-sm font-black text-[#1A2B4C] uppercase mb-8">Daily Integrity Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={integrityHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                      <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="score" stroke="#1A2B4C" strokeWidth={4} fill="#1A2B4C" fillOpacity={0.05} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white">
                <h3 className="text-sm font-black text-[#1A2B4C] uppercase mb-8">Ward Performance Ranking</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workers.slice(0, 5)}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                      <Bar dataKey="integrity_score" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {/* TAB: Roster (Table view) */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-white overflow-hidden animate-fade-in">
             <div className="bg-[#1A2B4C] px-8 py-6 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Digital Service Ledger</h3>
                <span className="text-[10px] text-blue-200 font-bold uppercase">Total: {totalPersonnel} Employees</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Employee</th>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Designated Ward</th>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Score</th>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {workers.map(worker => (
                        <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-4">
                              <p className="text-xs font-black text-[#1A2B4C] uppercase">{worker.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">ID: MCD-2024-{worker.id}</p>
                           </td>
                           <td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase">{worker.ward_name}</td>
                           <td className="px-8 py-4 text-center">
                              <span className={`text-xs font-black ${parseFloat(worker.integrity_score) < 90 ? 'text-red-500' : 'text-green-600'}`}>{worker.integrity_score}%</span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">On Duty</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

// UI Component for Stats
const StatCard = ({ title, value, sub, icon, color, isAlert }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
  };

  return (
    <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group ${isAlert ? 'ring-2 ring-red-500 ring-offset-2 animate-pulse' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-[#1A2B4C] mb-1 leading-none">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{sub}</p>
    </div>
  );
};

export default CommissionerDashboard;