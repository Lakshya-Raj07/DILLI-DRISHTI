import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, IndianRupee, Activity, RefreshCw, 
  AlertTriangle, ShieldAlert, BarChart3, MapPin, 
  Globe, Bell, Zap, CheckCircle, AlertOctagon, Info, X
} from 'lucide-react';
import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Simulated Trend Data
const integrityHistory = [
  { day: 'Mon', score: 96.5 }, { day: 'Tue', score: 97.2 }, { day: 'Wed', score: 95.8 },
  { day: 'Thu', score: 98.4 }, { day: 'Fri', score: 97.9 }, { day: 'Sat', score: 98.2 }, { day: 'Sun', score: 98.4 },
];

const CommissionerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]); // INSTRUCTION: Heatmap State
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false); // For Nexus Breaker Overlay
  const [rotationResults, setRotationResults] = useState(null); // For Success Modal
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // 1. Data Fetching & 10s Polling
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
      console.error("Critical Sync Error:", err); 
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const poll = setInterval(fetchDashboardData, 10000); // 10s Polling per Instruction
    return () => clearInterval(poll);
  }, []);

  // 2. Nexus Breaker Execution
  const triggerRotation = async () => {
    if (!window.confirm("CONFIRM COMMAND: Execute city-wide personnel rotation? This action breaks local nexus points.")) return;
    
    setRotating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/trigger-rotation');
      setRotationResults(res.data.transfers);
      fetchDashboardData();
    } catch (err) {
      alert("Rotation Engine Failure: Check Logs");
    } finally {
      setRotating(false);
    }
  };

  // 3. Heatmap Color Logic
  const getWardColor = (avg) => {
    const score = parseFloat(avg);
    if (score >= 90) return '#22C55E'; // Green (Safe)
    if (score >= 80) return '#EAB308'; // Yellow (Suspicious)
    return '#EF4444'; // Red (Corruption Hotspot)
  };

  const avgIntegrity = workers.length > 0 
    ? (workers.reduce((acc, curr) => acc + parseFloat(curr.integrity_score), 0) / workers.length).toFixed(2) 
    : "100.00";

  const criticalCount = workers.filter(w => parseFloat(w.integrity_score) < 90).length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] mcd-bg-pattern flex flex-col lg:flex-row relative">
      
      {/* Nexus Breaker Loading Overlay */}
      {rotating && (
        <div className="fixed inset-0 z-[5000] bg-[#1A2B4C]/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-10 text-center">
          <AlertOctagon size={80} className="text-orange-500 animate-spin-slow mb-8" />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Nexus Breaker Protocol Active</h2>
          <p className="text-xl font-bold text-blue-300 animate-pulse uppercase tracking-[0.2em]">Algorithm Shuffling Personnel to Break Nexus...</p>
        </div>
      )}

      {/* 1. Sidebar - Authority Control */}
      <aside className="w-full lg:w-72 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-900/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Dilli Drishti</h1>
            <p className="text-[9px] text-blue-300 font-bold tracking-[0.2em] mt-1 uppercase">HQ Command</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<Globe size={18}/>} label="Live Monitoring" active />
          <NavItem icon={<BarChart3 size={18}/>} label="Integrity Analytics" />
          <NavItem icon={<Users size={18}/>} label="Deployment Roster" />
          <NavItem icon={<ShieldAlert size={18}/>} label="Corruption Heatmap" />
        </nav>

        {/* NUCLEAR ACTION: Execute Periodic Rotation */}
        <div className="mt-8 space-y-4">
          <button 
            onClick={triggerRotation}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xl hover:scale-[1.02] transition-all group border border-red-400/30"
          >
            <AlertOctagon className="text-white group-hover:rotate-90 transition-transform duration-500" size={24} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Execute Periodic Rotation</span>
          </button>
        </div>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">SHA-256 Hash Ledger</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-400">
              <Activity size={12} className="animate-pulse" /> IMMUTABLE AUDIT ACTIVE
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
              <MapPin size={14} className="text-orange-500" /> Administrative Headquarters • Delhi
            </div>
            <h2 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Strategic War Room</h2>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[24px] shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center"><Bell size={20} className="text-slate-600" /></div>
             <div>
                <p className="text-xs font-black text-[#1A2B4C] uppercase">Commissioner</p>
                <p className="text-[10px] text-slate-400 font-bold">Sync: {lastUpdated}</p>
             </div>
             <button onClick={fetchDashboardData} className="ml-4 p-2 bg-[#1A2B4C] text-white rounded-xl hover:bg-blue-900 shadow-md">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Force" value={workers.length} sub="Active Field Agents" icon={<Users />} color="blue" />
          <StatCard title="City Integrity" value={`${avgIntegrity}%`} sub="Real-time Average" icon={<ShieldCheck />} color="green" />
          <StatCard title="High Risk Zones" value={heatmapData.filter(h => parseFloat(h.avg_integrity) < 80).length} sub="Immediate Rotation Req." icon={<AlertTriangle />} color="red" />
          <StatCard title="Encryption" value="v5.6" sub="SHA-256 Ledger Base" icon={<Info />} color="orange" />
        </div>

        {/* 4. Map and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* INSTRUCTION: Map Heatmap Visualization */}
          <div className="lg:col-span-2 bg-white rounded-[40px] p-2 shadow-xl border border-white relative overflow-hidden h-[500px]">
            <div className="absolute top-6 left-6 z-[1000] bg-[#1A2B4C]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
               <Activity size={14} className="text-green-400 animate-pulse" /> Strategic Corruption Heatmap
            </div>
            <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full rounded-[38px]">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              {heatmapData.map(ward => (
                <Circle 
                  key={ward.id}
                  center={[parseFloat(ward.lat), parseFloat(ward.lng)]} 
                  radius={ward.radius_meters || 1000}
                  pathOptions={{ 
                    color: getWardColor(ward.avg_integrity), 
                    fillColor: getWardColor(ward.avg_integrity), 
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <h4 className="font-black text-[#1A2B4C] uppercase text-xs mb-1">{ward.ward_name}</h4>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">Staff Count: <span className="text-[#1A2B4C]">{ward.staff_count}</span></p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">Avg Integrity: <span className={parseFloat(ward.avg_integrity) < 80 ? 'text-red-600' : 'text-green-600'}>{parseFloat(ward.avg_integrity).toFixed(2)}%</span></p>
                      </div>
                      {parseFloat(ward.avg_integrity) < 80 && (
                        <div className="mt-2 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
                           <AlertTriangle size={12} className="text-red-600" />
                           <span className="text-[8px] font-black text-red-600 uppercase">Priority Rotation Required</span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          {/* Critical Alerts Sidebar */}
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white flex flex-col h-[500px]">
            <h3 className="text-sm font-black text-[#1A2B4C] uppercase mb-6 flex items-center gap-2"><Zap size={18} className="text-orange-500" /> Personnel Under Surveillance</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {workers.filter(w => parseFloat(w.integrity_score) < 90).map(worker => (
                <div key={worker.id} className="bg-red-50 border border-red-100 p-4 rounded-[24px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#1A2B4C] font-black text-xs uppercase">{worker.name}</p>
                      <p className="text-red-800/60 font-bold text-[10px] uppercase">{worker.ward_name}</p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded-lg"><p className="text-red-600 font-black text-xs">{worker.integrity_score}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Analytics & Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-white">
            <h3 className="text-xs font-black text-[#1A2B4C] uppercase mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> City Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={integrityHistory}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis domain={[90, 100]} axisLine={false} tickLine={false} hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="score" stroke="#1A2B4C" strokeWidth={4} fillOpacity={0.1} fill="#1A2B4C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-xl border border-white overflow-hidden flex flex-col">
            <div className="bg-[#1A2B4C] px-8 py-5 flex justify-between items-center text-white">
               <h3 className="text-xs font-black uppercase">Force Command Roster</h3>
               <span className="text-[10px] text-blue-200 font-bold uppercase flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Live Duty Feed</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[250px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Employee</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Assigned Ward</th>
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

      {/* Rotation Success Modal */}
      {rotationResults && (
        <div className="fixed inset-0 z-[6000] bg-black/80 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-green-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase flex items-center gap-3"><CheckCircle size={28} /> Rotation Successful</h3>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Personnel Re-deployed to prevent corruption nexuses</p>
              </div>
              <button onClick={() => setRotationResults(null)}><X size={30} /></button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto">
               <div className="space-y-4">
                  {rotationResults.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div>
                          <p className="text-xs font-black text-[#1A2B4C] uppercase">{t.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">MCD ID: {t.id}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase">{t.old_ward}</span>
                          <span className="text-green-600 font-bold">➔</span>
                          <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-lg">{t.new_ward}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
               <button onClick={() => setRotationResults(null)} className="px-10 py-3 bg-[#1A2B4C] text-white rounded-xl text-xs font-black uppercase">Dismiss Control</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-200/50 hover:bg-white/5'}`}>
    {icon} <span className="text-sm font-bold">{label}</span>
  </div>
);

const StatCard = ({ title, value, sub, icon, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{React.cloneElement(icon, { size: 24 })}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-[#1A2B4C] mb-1 leading-none">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{sub}</p>
    </div>
  );
};

export default CommissionerDashboard;