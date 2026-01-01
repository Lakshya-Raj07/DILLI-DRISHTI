import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShieldCheck, IndianRupee, Activity, RefreshCw, AlertTriangle, ShieldAlert, BarChart3 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Icons Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 1. Simulated Trend Data (Keeping it static for professional look)
const integrityHistory = [
  { day: 'Mon', score: 96.5 }, { day: 'Tue', score: 97.2 }, { day: 'Wed', score: 95.8 },
  { day: 'Thu', score: 98.4 }, { day: 'Fri', score: 97.9 }, { day: 'Sat', score: 98.2 }, { day: 'Sun', score: 98.4 },
];

// --- Sub-Component: Critical Alerts Panel ---
const CriticalAlerts = ({ workers }) => {
  const lowIntegrityWorkers = workers.filter(w => parseFloat(w.integrity_score) < 90);

  return (
    <div className="bg-white border-2 border-red-200 shadow-xl rounded-lg overflow-hidden h-[400px] flex flex-col">
      <div className="bg-red-50 p-4 border-b-2 border-red-100 flex items-center justify-between">
        <h3 className="text-red-800 font-black uppercase text-[10px] tracking-widest flex items-center">
          <AlertTriangle size={14} className="mr-2" /> Critical Alerts
        </h3>
        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {lowIntegrityWorkers.length > 0 ? (
          lowIntegrityWorkers.map(worker => (
            <div key={worker.id} className="border-l-4 border-red-600 bg-red-50 p-3 rounded-r-md animate-in fade-in slide-in-from-right-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#002147] font-black text-[11px] uppercase">{worker.name}</p>
                  <p className="text-gray-500 font-bold text-[9px] uppercase">{worker.ward_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-black text-sm">{worker.integrity_score}%</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <ShieldCheck size={40} className="text-green-600 mb-2" />
            <p className="text-[10px] font-black text-gray-500 uppercase">System Secure<br/>No Breaches</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const CommissionerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/check-db');
      setWorkers(res.data);
    } catch (err) { console.error("Database Error:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Logic: Live Average Calculation
  const avgIntegrity = workers.length > 0 
    ? (workers.reduce((acc, curr) => acc + parseFloat(curr.integrity_score), 0) / workers.length).toFixed(2) 
    : "100.00";

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end border-b-4 border-[#002147] pb-4">
        <div>
          <h2 className="text-4xl font-black text-[#002147] uppercase tracking-tighter italic">Administrative Control Room</h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Personnel Integrity & Deployment Ledger</p>
        </div>
        <button onClick={fetchData} className="flex items-center bg-white border-2 border-[#002147] px-4 py-2 rounded font-black text-[#002147] text-[10px] hover:bg-gray-50 transition-all shadow-sm">
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GovCard title="Personnel Strength" value={workers.length} color="border-blue-900" icon={<Users size={20}/>} />
        <GovCard title="Live On-Duty" value={workers.length} color="border-green-600" icon={<Activity size={20}/>} />
        {/* Dynamic Avg Integrity Card */}
        <GovCard title="Avg Integrity" value={`${avgIntegrity}%`} color="border-purple-800" icon={<ShieldCheck size={20}/>} />
        <GovCard title="Payroll Ledger" value="Locked" color="border-orange-600" icon={<IndianRupee size={20}/>} />
      </div>

      {/* Map & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-[#002147] font-black uppercase text-xs tracking-widest ml-1">Geographic Deployment Map</h3>
          <div className="h-[400px] w-full border-2 border-[#002147] rounded-lg overflow-hidden shadow-2xl">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {workers.filter(w => w.lat && w.lng).map(worker => (
                <React.Fragment key={worker.id}>
                  <Circle 
                    center={[parseFloat(worker.lat), parseFloat(worker.lng)]} 
                    radius={parseInt(worker.radius_meters) || 1000}
                    pathOptions={{ color: '#002147', fillColor: '#3b82f6', fillOpacity: 0.1 }}
                  />
                  <Marker position={[parseFloat(worker.lat), parseFloat(worker.lng)]}>
                    <Popup>
                      <div className="p-1 font-black uppercase text-[10px] text-[#002147]">{worker.name}</div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-[#002147] font-black uppercase text-xs tracking-widest ml-1 text-red-600">Critical Alerts</h3>
          <CriticalAlerts workers={workers} />
        </div>
      </div>

      {/* Analytics & Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulated Trend Chart */}
        <div className="lg:col-span-1 bg-white border-2 border-gray-200 shadow-xl rounded-lg p-6 h-[350px]">
          <h3 className="text-[#002147] font-black uppercase text-[10px] mb-4 flex items-center">
            <BarChart3 size={14} className="mr-2" /> Zonal Trend (7-Day Simulation)
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={integrityHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="day" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
              <YAxis domain={[90, 100]} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="score" stroke="#002147" strokeWidth={3} dot={{r: 4, fill: '#ff9933', strokeWidth: 2, stroke: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Roster Table */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-200 shadow-xl overflow-hidden rounded-lg flex flex-col">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 text-[#002147] font-black uppercase text-[10px]">
            Active Duty Roster
          </div>
          <div className="overflow-y-auto flex-1 max-h-[295px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white uppercase text-[9px] sticky top-0 z-10">
                <tr>
                  <th className="p-4">Service ID</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Ward</th>
                  <th className="p-4 text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workers.map(worker => (
                  <tr key={worker.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-mono text-gray-400">#MCD-{worker.id}</td>
                    <td className="p-4 font-black text-[#002147] uppercase">{worker.name}</td>
                    <td className="p-4 font-bold text-gray-500 uppercase">{worker.ward_name}</td>
                    <td className={`p-4 text-center font-black ${parseFloat(worker.integrity_score) < 90 ? 'text-red-600' : 'text-green-600'}`}>
                      {worker.integrity_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const GovCard = ({ title, value, color, icon }) => (
  <div className={`bg-white p-4 border-b-4 ${color} shadow-md flex justify-between items-center transform hover:-translate-y-1 transition-all`}>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-[#002147]">{value}</p>
    </div>
    <div className="text-gray-100">{icon}</div>
  </div>
);

export default CommissionerDashboard;