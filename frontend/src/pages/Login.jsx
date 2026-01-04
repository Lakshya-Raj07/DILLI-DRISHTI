// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Lock, User, ShieldCheck, Landmark, Fingerprint, Info, CheckCircle2 } from 'lucide-react';

// const Login = ({ setUserRole }) => {
//   const [role, setRole] = useState('worker');
//   const [empId, setEmpId] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // Utility: Generate or Fetch Unique Device Fingerprint
//   const getDeviceId = () => {
//     let deviceId = localStorage.getItem('mcd_device_id');
//     if (!deviceId) {
//       deviceId = 'DEV-' + Math.random().toString(36).slice(2, 11).toUpperCase();
//       localStorage.setItem('mcd_device_id', deviceId);
//     }
//     return deviceId;
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const generatedId = getDeviceId();

//     try {
//       // Step 1: Real Backend Authorization Call
//       const response = await axios.post('http://localhost:5000/api/login', {
//         phone_number: empId, // Mapping Credential ID to phone_number for this demo
//         device_id: generatedId
//       });

//       // Step 2: Handle Successful Authorization
//       if (response.status === 200) {
//         const userData = response.data.user;
        
//         // Update Global State
//         setUserRole(userData.role);
        
//         // Store session for persistence
//         localStorage.setItem('user_session', JSON.stringify(userData));

//         const routes = {
//           admin: '/admin',
//           zonal: '/zonal',
//           supervisor: '/supervisor',
//           worker: '/worker'
//         };

//         // Navigate based on actual DB role
//         navigate(routes[userData.role] || '/worker');
//       }

//     } catch (err) {
//       console.error("Login Security Error:", err);
      
//       if (err.response?.status === 403) {
//         // Device Mismatch Protection
//         alert('❌ Security Violation: Unrecognized Device! This incident has been logged and reported to HQ.');
//       } else if (err.response?.status === 404) {
//         alert('❌ Identification Failed: User not found in MCD database.');
//       } else {
//         alert('❌ Critical System Error: Unable to reach Authorization Server.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roleLabels = {
//     worker: 'Field Worker',
//     supervisor: 'Supervisor',
//     zonal: 'Zonal Head',
//     admin: 'Commissioner'
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center mcd-bg-pattern px-4">
//       {/* Dynamic Background Blurs */}
//       <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] opacity-30 pulse-animation"></div>
//       <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-40 pulse-animation"></div>

//       <div className="relative w-full max-w-[1100px] flex flex-col md:flex-row glass-effect rounded-[40px] overflow-hidden animate-fade-in shadow-2xl">
        
//         {/* Left Section: Brand & Trust */}
//         <div className="w-full md:w-5/12 bg-[#1A2B4C] p-12 text-white flex flex-col justify-between relative overflow-hidden">
//           <div className="z-10">
//             <div className="flex items-center gap-4 mb-12">
//               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
//                 <Landmark size={36} className="text-orange-400" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Dilli Drishti</h1>
//                 <p className="text-[10px] text-blue-300 font-bold tracking-[0.3em] mt-2 uppercase">Municipal Corporation of Delhi</p>
//               </div>
//             </div>
            
//             <h2 className="text-4xl font-black leading-[1.1] mb-8">
//               Transforming <br />
//               <span className="text-orange-400">Governance</span> <br />
//               with Integrity.
//             </h2>
            
//             <div className="space-y-6">
//               {[
//                 { icon: <ShieldCheck className="text-green-400" />, text: "Zero-Knowledge Authentication" },
//                 { icon: <Fingerprint className="text-blue-400" />, text: "Device Fingerprint Binding" },
//                 { icon: <CheckCircle2 className="text-orange-400" />, text: "Immutable Audit Ledger (SHA-256)" }
//               ].map((item, idx) => (
//                 <div key={idx} className="flex items-center gap-4 text-sm font-semibold text-blue-100/80">
//                   <div className="bg-white/5 p-2 rounded-lg">{item.icon}</div>
//                   {item.text}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-16 pt-8 border-t border-white/10 z-10">
//             <p className="text-xs text-blue-200/50 leading-relaxed font-medium italic">
//               "Smart workforce management for a cleaner, more transparent National Capital."
//             </p>
//           </div>
          
//           <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full"></div>
//           <div className="absolute bottom-[-100px] left-[-20px] w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
//         </div>

//         {/* Right Section: Interactive Login */}
//         <div className="w-full md:w-7/12 p-12 bg-white/40">
//           <div className="max-w-md mx-auto">
//             <div className="mb-10 text-center md:text-left">
//               <h3 className="text-3xl font-black text-[#1A2B4C] mb-2 tracking-tight">Access Gateway</h3>
//               <p className="text-slate-500 text-sm font-medium">Provide your registered phone number for secure binding.</p>
//             </div>

//             <form onSubmit={handleLogin} className="space-y-6">
//               {/* Role Selection (UI only - Logic comes from DB) */}
//               <div className="grid grid-cols-2 gap-3 mb-8">
//                 {['worker', 'supervisor', 'zonal', 'admin'].map((r) => (
//                   <button
//                     key={r}
//                     type="button"
//                     onClick={() => setRole(r)}
//                     className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-300 ${
//                       role === r 
//                         ? 'bg-white border-[#1A2B4C] shadow-lg scale-[1.02]' 
//                         : 'bg-white/50 border-transparent hover:border-slate-200 grayscale opacity-70'
//                     }`}
//                   >
//                     <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${role === r ? 'text-blue-600' : 'text-slate-400'}`}>
//                       Level {r === 'admin' ? '01' : r === 'zonal' ? '02' : r === 'supervisor' ? '03' : '04'}
//                     </span>
//                     <span className="text-sm font-bold text-[#1A2B4C]">{roleLabels[r]}</span>
//                   </button>
//                 ))}
//               </div>

//               {/* Input Fields */}
//               <div className="space-y-4">
//                 <div className="group">
//                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number (Credential ID)</label>
//                   <div className="relative">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A2B4C] transition-colors" size={20} />
//                     <input 
//                       type="text" 
//                       required
//                       placeholder="9876543210" 
//                       value={empId}
//                       onChange={(e) => setEmpId(e.target.value)}
//                       className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1A2B4C] transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm" 
//                     />
//                   </div>
//                 </div>

//                 <div className="group">
//                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Password</label>
//                   <div className="relative">
//                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A2B4C] transition-colors" size={20} />
//                     <input 
//                       type="password" 
//                       required
//                       placeholder="••••••••••••" 
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1A2B4C] transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm" 
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Action Button */}
//               <button 
//                 type="submit" 
//                 disabled={loading}
//                 className="w-full py-5 bg-[#1A2B4C] text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-4 group overflow-hidden relative"
//               >
//                 {loading ? (
//                   <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 ) : (
//                   <>
//                     <span className="relative z-10 flex items-center gap-2">Authorize Secure Login <ShieldCheck size={20} /></span>
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Disclaimer */}
//             <div className="mt-12 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex gap-3">
//               <Info className="text-orange-500 shrink-0 mt-0.5" size={16} />
//               <p className="text-[10px] text-orange-900/60 font-medium leading-relaxed uppercase tracking-tighter">
//                 Internal Portal: Unauthorized access is strictly monitored under the IT Act 2026. Every session is cryptographically hashed for security.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* External Branding Footer */}
//       <div className="absolute bottom-8 w-full text-center">
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-60">
//           Government of NCT Delhi | Digital India Initiative
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, ShieldCheck, Landmark, Fingerprint, Info, CheckCircle2 } from 'lucide-react';

const Login = ({ setUserRole }) => {
  const [role, setRole] = useState('worker');
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // Local state for ID tracking
  const navigate = useNavigate();

  // Utility: Generate or Fetch Unique Device Fingerprint (Using sessionStorage for Tab-level Isolation)
  const getDeviceId = () => {
    // UPDATED: Switched from localStorage to sessionStorage to support multi-tab device simulation
    let deviceId = sessionStorage.getItem('mcd_device_id');
    if (!deviceId) {
      deviceId = 'DEV-' + Math.random().toString(36).slice(2, 11).toUpperCase();
      sessionStorage.setItem('mcd_device_id', deviceId);
    }
    return deviceId;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const generatedId = getDeviceId();

    try {
      // Step 1: Real Backend Authorization Call
      const response = await axios.post('http://localhost:5000/api/login', {
        phone_number: empId, 
        device_id: generatedId
      });

      // Step 2: Handle Successful Authorization
      if (response.status === 200) {
        // UPDATED: Ensuring id and role are captured from response
        const { id, role: userRoleFromDb } = response.data.user;
        
        // Update States
        setUserRole(userRoleFromDb); // Setting global role state
        setUserId(id);             // Setting local ID state
        
        // Store session for persistence (sessionStorage used here as well)
        sessionStorage.setItem('user_session', JSON.stringify(response.data.user));

        const routes = {
          admin: '/admin',
          zonal: '/zonal',
          supervisor: '/supervisor',
          worker: '/worker'
        };

        // Navigate based on actual DB role
        navigate(routes[userRoleFromDb] || '/worker');
      }

    } catch (err) {
      console.error("Login Security Error:", err);
      
      if (err.response?.status === 403) {
        alert('❌ Security Violation: Unrecognized Device! Incident reported to HQ.');
      } else if (err.response?.status === 404) {
        alert('❌ Identification Failed: User not found in MCD database.');
      } else {
        alert('❌ Critical System Error: Unable to reach Authorization Server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    worker: 'Field Worker',
    supervisor: 'Supervisor',
    zonal: 'Zonal Head',
    admin: 'Commissioner'
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center mcd-bg-pattern px-4">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] opacity-30 pulse-animation"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-40 pulse-animation"></div>

      <div className="relative w-full max-w-[1100px] flex flex-col md:flex-row glass-effect rounded-[40px] overflow-hidden animate-fade-in shadow-2xl">
        
        <div className="w-full md:w-5/12 bg-[#1A2B4C] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                <Landmark size={36} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Dilli Drishti</h1>
                <p className="text-[10px] text-blue-300 font-bold tracking-[0.3em] mt-2 uppercase">Municipal Corporation of Delhi</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-black leading-[1.1] mb-8">
              Transforming <br />
              <span className="text-orange-400">Governance</span> <br />
              with Integrity.
            </h2>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck className="text-green-400" />, text: "Zero-Knowledge Authentication" },
                { icon: <Fingerprint className="text-blue-400" />, text: "Dynamic Session-Device Binding" },
                { icon: <CheckCircle2 className="text-orange-400" />, text: "Immutable Audit Ledger (SHA-256)" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 text-sm font-semibold text-blue-100/80">
                  <div className="bg-white/5 p-2 rounded-lg">{item.icon}</div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 z-10">
            <p className="text-xs text-blue-200/50 leading-relaxed font-medium italic">
              "Smart workforce management for a cleaner, more transparent National Capital."
            </p>
          </div>
          
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-[-100px] left-[-20px] w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full md:w-7/12 p-12 bg-white/40">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-3xl font-black text-[#1A2B4C] mb-2 tracking-tight">Access Gateway</h3>
              <p className="text-slate-500 text-sm font-medium">Provide your registered credentials for secure binding.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['worker', 'supervisor', 'zonal', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-300 ${
                      role === r 
                        ? 'bg-white border-[#1A2B4C] shadow-lg scale-[1.02]' 
                        : 'bg-white/50 border-transparent hover:border-slate-200 grayscale opacity-70'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${role === r ? 'text-blue-600' : 'text-slate-400'}`}>
                      Level {r === 'admin' ? '01' : r === 'zonal' ? '02' : r === 'supervisor' ? '03' : '04'}
                    </span>
                    <span className="text-sm font-bold text-[#1A2B4C]">{roleLabels[r]}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number (Credential ID)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A2B4C] transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      placeholder="9876543210" 
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1A2B4C] transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A2B4C] transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1A2B4C] transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#1A2B4C] text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-4 group overflow-hidden relative"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2">Authorize Secure Login <ShieldCheck size={20} /></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex gap-3">
              <Info className="text-orange-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-orange-900/60 font-medium leading-relaxed uppercase tracking-tighter">
                Internal Portal: Unauthorized access is strictly monitored under the IT Act 2026. Every session is cryptographically hashed for security.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 w-full text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-60">
          Government of NCT Delhi | Digital India Initiative
        </p>
      </div>
    </div>
  );
};

export default Login;