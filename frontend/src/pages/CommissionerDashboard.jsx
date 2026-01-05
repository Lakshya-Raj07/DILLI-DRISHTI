import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, IndianRupee, Activity, RefreshCw, 
  AlertTriangle, ShieldAlert, BarChart3, MapPin, 
  Globe, Bell, Zap, CheckCircle, AlertOctagon, Info, X, ShieldX, Database
} from 'lucide-react';
import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false); 
  const [rotationResults, setRotationResults] = useState(null); 
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // 1. Data Fetching & 10s Polling Logic
  const fetchDashboardData = async () => {
    try {
      const [workerRes, heatmapRes] = await Promise.all([
        axios.get('http://localhost:5000/check-db'),
        axios.get('http://localhost:5000/api/admin/heatmap')
      ]);
      setWorkers(workerRes.data);
      setHeatmapData(heatmapRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) { 
      console.error("War Room Sync Error:", err); 
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const poll = setInterval(fetchDashboardData, 10000); 
    return () => clearInterval(poll);
  }, []);

  // 2. Nexus Breaker Execution
  const triggerRotation = async () => {
    if (!window.confirm("CRITICAL COMMAND: Execute periodic rotation to break administrative nexuses?")) return;
    setRotating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/trigger-rotation');
      setRotationResults(res.data.transfers);
      fetchDashboardData();
    } catch (err) {
      alert("System Lockdown: Rotation Engine failed to execute.");
    } finally {
      setRotating(false);
    }
  };

  const getWardColor = (avg) => {
    const score = parseFloat(avg);
    if (score > 90) return '#22C55E'; 
    if (score >= 80) return '#EAB308'; 
    return '#EF4444'; 
  };

  const avgIntegrity = workers.length > 0 
    ? (workers.reduce((acc, curr) => acc + parseFloat(curr.integrity_score), 0) / workers.length).toFixed(2) 
    : "100.00";

  // RESTORED: Integrity History for Chart
  const integrityHistory = [
    { day: 'Mon', score: 92.5 }, { day: 'Tue', score: 94.2 }, { day: 'Wed', score: 91.8 },
    { day: 'Thu', score: 95.4 }, { day: 'Fri', score: 93.9 }, { day: 'Today', score: parseFloat(avgIntegrity) }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] mcd-bg-pattern flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* 1. NEXUS BREAKER OVERLAY */}
      {rotating && (
        <div className="fixed inset-0 z-[9999] bg-[#1A2B4C]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-10 text-center animate-fade-in">
          <AlertOctagon size={100} className="text-orange-500 animate-spin-slow mb-8" />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Nexus Breaker Active</h2>
          <p className="text-blue-300 font-bold uppercase tracking-[0.3em] animate-pulse">Algorithm Shuffling Personnel...</p>
        </div>
      )}

      {/* 2. SIDEBAR AUTHORITY CONTROL */}
      <aside className="w-full lg:w-80 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-900/20"><ShieldCheck size={28} /></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Dilli Drishti</h1>
            <p className="text-[9px] text-blue-300 font-bold tracking-[0.2em] mt-1 uppercase">HQ Command</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<Globe size={18}/>} label="Live Monitoring" active />
          <NavItem icon={<BarChart3 size={18}/>} label="System Analytics" />
          <NavItem icon={<Users size={18}/>} label="Personnel Registry" />
        </nav>

        <div className="mt-8">
          <button onClick={triggerRotation} className="w-full py-5 px-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all border border-red-400/30 group">
            <ShieldX size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Execute Periodic Rotation</span>
          </button>
        </div>

        <div className="mt-auto pt-8 border-t border-white/10 text-green-400 text-[10px] font-black uppercase flex items-center gap-2">
          <Activity size={12} className="animate-pulse" /> SHA-256 Ledger Active
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest mb-1"><MapPin size={14} className="text-orange-500" /> Delhi Central Command</div>
            <h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Strategic War Room</h2>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[24px] shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center text-[#1A2B4C]"><Bell size={20} /></div>
             <div>
                <p className="text-xs font-black text-[#1A2B4C] uppercase">Commissioner</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sync: {lastUpdated}</p>
             </div>
             <button onClick={fetchDashboardData} className="ml-4 p-2 bg-[#1A2B4C] text-white rounded-xl shadow-md transition-all active:scale-90"><RefreshCw size={18} /></button>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Personnel Strength" value={workers.length} sub="Field Agents" icon={<Users />} color="blue" />
          <StatCard title="City Integrity" value={`${avgIntegrity}%`} sub="Avg Score" icon={<ShieldCheck />} color="green" />
          <StatCard title="Critical Alerts" value={workers.filter(w => parseFloat(w.integrity_score) < 90).length} sub="Immediate Action" icon={<AlertTriangle />} color="red" />
          <StatCard title="Wards Online" value={heatmapData.length} sub="Live Tracking" icon={<Zap />} color="orange" />
        </div>

        {/* MAP & SURVEILLANCE SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-[40px] p-2 shadow-xl border border-white h-[500px] relative overflow-hidden">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full rounded-[38px]">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              {heatmapData.map(ward => (
                <Circle key={ward.id} center={[parseFloat(ward.lat), parseFloat(ward.lng)]} radius={ward.radius_meters || 1500} pathOptions={{ color: getWardColor(ward.avg_integrity), fillColor: getWardColor(ward.avg_integrity), fillOpacity: 0.5, weight: 3 }}>
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <h4 className="font-black text-[#1A2B4C] uppercase text-xs">{ward.ward_name}</h4>
                      <p className="text-[10px] font-bold text-slate-500">Avg Integrity: {parseFloat(ward.avg_integrity).toFixed(2)}%</p>
                      <p className="text-[10px] font-bold text-slate-500">Staff Count: {ward.staff_count}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          {/* RESTORED: PERSONNEL UNDER SURVEILLANCE */}
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white flex flex-col h-[500px]">
            <h3 className="text-sm font-black text-[#1A2B4C] uppercase mb-6 flex items-center gap-2"><Zap size={18} className="text-orange-500" /> Active Alerts</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {workers.filter(w => parseFloat(w.integrity_score) < 90).map(worker => (
                <div key={worker.id} className="bg-red-50 border border-red-100 p-4 rounded-[24px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#1A2B4C] font-black text-xs uppercase">{worker.name}</p>
                      <p className="text-red-800/60 font-bold text-[10px] uppercase">{worker.ward_name}</p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded-lg shadow-sm"><p className="text-red-600 font-black text-xs">{worker.integrity_score}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRENDS & ACTIVE DUTY ROSTER TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white">
              <h3 className="text-xs font-black text-[#1A2B4C] uppercase mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> City Trend</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={integrityHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                    <YAxis domain={[80, 100]} axisLine={false} hide />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Area type="monotone" dataKey="score" stroke="#1A2B4C" strokeWidth={4} fillOpacity={0.1} fill="#1A2B4C" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* RESTORED: FORCE COMMAND ROSTER TABLE */}
           <div className="lg:col-span-2 bg-white rounded-[40px] shadow-xl border border-white overflow-hidden flex flex-col">
            <div className="bg-[#1A2B4C] px-8 py-5 flex justify-between items-center text-white">
               <h3 className="text-xs font-black uppercase tracking-widest">Active Duty Roster</h3>
               <span className="text-[10px] text-blue-200 font-bold uppercase flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Live Feed</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[250px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Employee Identity</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Deployed Zone</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {workers.map(worker => (
                    <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-xs font-black text-[#1A2B4C] uppercase">{worker.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">#MCD-{worker.id}</p>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase">{worker.ward_name}</td>
                      <td className="px-8 py-4 text-center">
                        <span className={`text-xs font-black ${parseFloat(worker.integrity_score) < 90 ? 'text-red-500' : 'text-green-600'}`}>{worker.integrity_score}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ROTATION SUCCESS MODAL */}
      {rotationResults && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-green-600 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-2xl font-black uppercase flex items-center gap-3"><CheckCircle size={28} /> Rotation Successful</h3></div>
              <button onClick={() => setRotationResults(null)}><X size={30} /></button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto">
               <div className="space-y-4">
                  {rotationResults.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-xs font-black text-[#1A2B4C] uppercase">{t.worker}</p>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">{t.from}</span>
                          <span className="text-green-600 font-bold">➔</span>
                          <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-lg">{t.new_ward || t.to}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5 hover:text-white'}`}>
    {icon} <span className="text-sm font-bold">{label}</span>
  </div>
);

const StatCard = ({ title, value, sub, icon, color }) => {
  const colors = { blue: 'text-blue-600 bg-blue-50', green: 'text-green-600 bg-green-50', red: 'text-red-600 bg-red-50', orange: 'text-orange-600 bg-orange-50' };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-[#1A2B4C] mb-1">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{sub}</p>
    </div>
  );
};

export default CommissionerDashboard;