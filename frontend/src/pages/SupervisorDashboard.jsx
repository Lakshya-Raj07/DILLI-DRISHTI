import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, ShieldAlert, Radio, RefreshCw } from 'lucide-react';

const SupervisorDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [pingStatus, setPingStatus] = useState(null);

  const fetchTeam = async () => {
    try {
      const res = await axios.get('http://localhost:5000/check-db');
      setWorkers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTeam(); }, []);

  const triggerPing = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/ping/trigger', { employee_id: id });
      setPingStatus(`Ping Sent to Employee #${id}`);
      setTimeout(() => setPingStatus(null), 3000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b-4 border-orange-500 pb-3">
        <h2 className="text-2xl font-black text-[#002147] uppercase tracking-tighter italic">Field Operations: Ground Unit</h2>
        {pingStatus && <div className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-[10px] font-black uppercase animate-bounce">{pingStatus}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Attendance</p>
                <p className="text-3xl font-black text-[#002147]">100% <span className="text-xs text-gray-400 uppercase">(2/2 Verified)</span></p>
            </div>
            <UserCheck className="text-green-500 opacity-20" size={48} />
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-orange-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-800">Field Staff Identity Audit</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase">WARD 54 - ROHINI UNIT</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#002147] text-white text-[10px] uppercase tracking-widest">
            <tr>
              <th className="p-5">Officer</th>
              <th className="p-5">Last Activity</th>
              <th className="p-5">Integrity</th>
              <th className="p-5 text-center">Intervention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workers.map(worker => (
              <tr key={worker.id} className="hover:bg-orange-50 transition-colors">
                <td className="p-5 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`} alt="avatar" />
                    </div>
                    <span className="font-black text-[#002147] uppercase text-sm">{worker.name}</span>
                </td>
                <td className="p-5 text-xs font-bold text-gray-500">10:45 AM - GEO-LOCKED</td>
                <td className="p-5 font-mono font-black text-blue-800">{worker.integrity_score}</td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => triggerPing(worker.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center mx-auto transition-transform active:scale-95"
                  >
                    <Radio size={14} className="mr-2" /> Send Random Ping
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorDashboard;