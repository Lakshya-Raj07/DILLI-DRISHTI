import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, AlertTriangle, Map, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ZonalDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchZonalData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/check-db`);
      setWorkers(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchZonalData(); }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b-4 border-blue-800 pb-3">
        <h2 className="text-2xl font-black text-[#002147] uppercase tracking-tighter">Zonal Monitoring: North Delhi (Zone-01)</h2>
        <button onClick={fetchZonalData} className="p-2 border-2 border-blue-800 rounded hover:bg-gray-100">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-l-8 border-blue-800 shadow-lg rounded-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone Personnel</p>
          <p className="text-3xl font-black text-[#002147]">{workers.length}</p>
        </div>
        <div className="bg-white p-6 border-l-8 border-orange-500 shadow-lg rounded-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Alerts</p>
          <p className="text-3xl font-black text-orange-600">02</p>
        </div>
        <div className="bg-white p-6 border-l-8 border-green-600 shadow-lg rounded-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wards Covered</p>
          <p className="text-3xl font-black text-green-700">12/12</p>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-blue-50 p-4 font-black text-xs uppercase tracking-widest border-b border-gray-200 text-blue-900">Ward-Wise Resource Allocation</div>
        <table className="w-full text-left">
          <thead className="bg-[#002147] text-white text-[10px] uppercase">
            <tr>
              <th className="p-4">Ward Name</th>
              <th className="p-4">Supervisor</th>
              <th className="p-4">Total Staff</th>
              <th className="p-4 text-center">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 italic">
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-bold">WARD 54 - ROHINI</td>
              <td className="p-4 text-sm text-gray-600">Sunita Devi</td>
              <td className="p-4 font-mono font-bold">45</td>
              <td className="p-4 text-center text-green-600 font-black">94%</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-bold">WARD 55 - PITAMPURA</td>
              <td className="p-4 text-sm text-gray-600">Sanjay Singh</td>
              <td className="p-4 font-mono font-bold">38</td>
              <td className="p-4 text-center text-orange-600 font-black">82%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZonalDashboard;