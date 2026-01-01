import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Landmark } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('worker');
  const [empId, setEmpId] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Role-based Redirection Logic
    if (role === 'admin') navigate('/admin');
    else if (role === 'zonal') navigate('/zonal');
    else if (role === 'supervisor') navigate('/supervisor');
    else navigate('/worker');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f4f7f9] px-4">
      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border-t-8 border-[#002147] overflow-hidden relative">
        
        {/* Decorative Saffron & Green Strips */}
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-orange-500"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-green-500"></div>

        <div className="p-10">
          {/* Logo & Branding */}
          <div className="text-center mb-10">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100 shadow-inner">
              <Landmark className="text-[#002147]" size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#002147] uppercase tracking-tighter leading-none">Access Control</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Single Sign-On | Dilli Drishti Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Role Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center">
                <ShieldCheck size={12} className="mr-1 text-blue-800" /> Administrative Role
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-[#002147] outline-none focus:border-[#002147] appearance-none cursor-pointer transition-all"
              >
                <option value="admin">Commissioner (Headquarters)</option>
                <option value="zonal">Zonal Officer (District)</option>
                <option value="supervisor">Field Supervisor</option>
                <option value="worker">Sanitation Worker</option>
              </select>
            </div>

            {/* Username/ID Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Employee Credentials</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#002147] transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="Employee ID / User-PIN" 
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#002147] font-bold text-[#002147] placeholder:text-gray-300 transition-all" 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Secret Key / Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#002147] transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#002147] font-bold transition-all" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-5 bg-[#002147] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-900 transition-all active:scale-95 border-b-4 border-blue-950 mt-4"
            >
              Verify & Authorize
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
             <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
               Warning: Unauthorized access to this portal is strictly prohibited and monitored under the IT Act 2026.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;