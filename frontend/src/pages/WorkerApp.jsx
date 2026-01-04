import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, ShieldAlert, IndianRupee, Camera, 
  Activity, History, X, CheckCircle2, 
  User, Briefcase, Map, ShieldCheck, Upload, LogOut 
} from 'lucide-react';

const WorkerApp = () => {
  // Real dynamic data states
  const [employeeId] = useState(1); // Pehle worker ki ID (Isse login context se bhi le sakte hain)
  const [workerData, setWorkerData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);

  // 1. Fetch Worker Profile Dynamically from Database
  const fetchWorkerProfile = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`http://localhost:5000/api/worker/${employeeId}`);
      setWorkerData(res.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setStatus({ type: 'error', message: "Failed to load profile data!" });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerProfile();
  }, [employeeId]);

  // Attendance Logic
  const handleAttendance = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await axios.post('http://localhost:5000/api/attendance/checkin', {
          employee_id: employeeId,
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
          face_score: 0.95 
        });
        setStatus({ type: 'success', message: res.data.message });
        // Attendance ke baad score refresh karo
        fetchWorkerProfile();
      } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.reason || "Verification Failed!" });
      }
      setLoading(false);
    }, () => {
      setStatus({ type: 'error', message: "GPS Location Error" });
      setLoading(false);
    });
  };

  // OTP Logic
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
  };

  const verifySalaryOtp = async () => {
    setVerifyingOtp(true);
    try {
      const finalOtp = otp.join('');
      await axios.post('http://localhost:5000/api/salary/verify', {
        employee_id: employeeId,
        otp: finalOtp
      });
      setStatus({ type: 'success', message: "Salary released to your bank account!" });
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP!");
    }
    setVerifyingOtp(false);
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A2B4C]">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase tracking-widest text-xs">Syncing with MCD Mainframe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] mcd-bg-pattern flex flex-col lg:flex-row font-sans">
      
      {/* 1. DYNAMIC SIDE PROFILE */}
      <aside className="w-full lg:w-96 bg-[#1A2B4C] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-900/20">
            <ShieldCheck size={20} />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">Dilli Drishti</span>
        </div>

        <div className="relative group mx-auto mb-8">
          <div className="w-40 h-40 rounded-[40px] border-4 border-orange-500/30 p-1 bg-white/5 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${workerData?.name || 'User'}`} 
              className="w-full h-full object-cover rounded-[35px]" 
              alt="worker-profile" 
            />
          </div>
          <label className="absolute bottom-2 right-2 bg-orange-500 p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-orange-600 transition-all border-4 border-[#1A2B4C]">
            <Upload size={20} />
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tight">{workerData?.name}</h3>
          <p className="text-orange-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">
             {workerData?.role === 'worker' ? 'Field Operations' : workerData?.role}
          </p>
        </div>

        <div className="space-y-4 flex-1">
          <DetailRow icon={<User size={16}/>} label="Service ID" value={`#MCD-2024-00${workerData?.id}`} />
          <DetailRow icon={<Map size={16}/>} label="Assigned Ward" value={workerData?.ward_name} />
          <DetailRow icon={<Briefcase size={16}/>} label="Status" value="On-Duty (Active)" />
          <DetailRow icon={<Activity size={16}/>} label="Integrity Index" value={`${workerData?.integrity_score}%`} isHigh={workerData?.integrity_score > 90} />
          
          <div className="p-5 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[28px] mt-6 shadow-inner">
            <p className="text-[9px] font-black text-blue-300 uppercase mb-1 tracking-widest">Pay-Scale Ledger</p>
            <p className="text-2xl font-black text-white">₹ {workerData?.base_salary?.toLocaleString()}</p>
          </div>
        </div>

        <button className="mt-10 flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-2xl transition-all border border-white/10 font-bold text-sm">
          <LogOut size={18} /> Terminate Session
        </button>
      </aside>

      {/* 2. MAIN ACTION AREA */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        
        {status && (
          <div className={`mb-8 p-5 rounded-[24px] border-l-8 shadow-xl flex items-center justify-between animate-fade-in ${status.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
            <div className="flex items-center gap-4 font-bold text-sm uppercase tracking-tight">
              {status.type === 'success' ? <CheckCircle2 /> : <ShieldAlert />}
              {status.message}
            </div>
            <button onClick={() => setStatus(null)}><X size={18}/></button>
          </div>
        )}

        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-xl shadow-slate-200 border border-white text-center relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
          
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Digital Geo-Verification</h2>
          
          <div className="max-w-md mx-auto mb-10 animate-pulse-soft">
            <div className="bg-blue-50 p-6 rounded-[32px] border-2 border-dashed border-blue-100">
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Target Zone</p>
               <p className="text-xl font-black text-[#1A2B4C] uppercase">{workerData?.ward_name}</p>
               <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-tight">Biometric & GPS handshake required</p>
            </div>
          </div>

          <button 
            onClick={handleAttendance}
            disabled={loading}
            className="group relative w-full max-w-lg py-6 bg-[#1A2B4C] hover:bg-slate-800 text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] mx-auto overflow-hidden flex items-center justify-center gap-4"
          >
            {loading ? (
               <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <> <MapPin className="text-orange-500 group-hover:animate-bounce" /> Punch Live Presence </>
            )}
          </button>
        </div>

        {/* Dynamic Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ActionCard 
            icon={<ShieldAlert className="text-orange-500" />} 
            title="Random Ping" 
            sub="Auth Prompt Check" 
            label="Respond Now" 
            color="orange"
          />
          <ActionCard 
            icon={<IndianRupee className="text-green-600" />} 
            title="Salary Vault" 
            sub="Secure OTP Access" 
            label="Release Payment" 
            onClick={() => setShowOtpModal(true)}
            color="green"
          />
        </div>
      </main>

      {/* 3. OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2B4C]/95 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20">
            <div className="bg-orange-500 p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-3 rounded-2xl"><IndianRupee size={28} /></div>
                <button onClick={() => setShowOtpModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Identity Confirmation</h3>
              <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest mt-1">Direct-to-Bank Transfer</p>
            </div>
            
            <div className="p-10 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase mb-8">Confirm payout for amount: ₹ {workerData?.base_salary}</p>
              <div className="flex justify-between gap-3 mb-10">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-16 border-2 border-slate-100 bg-slate-50 rounded-2xl text-center text-2xl font-black text-[#1A2B4C] focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              <button 
                onClick={verifySalaryOtp}
                disabled={verifyingOtp || otp.includes('')}
                className="w-full py-5 bg-[#1A2B4C] text-white rounded-[24px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                {verifyingOtp ? "Authenticating..." : <>Unlock & Release <CheckCircle2 size={20}/></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value, isHigh }) => (
  <div className="flex items-center gap-4 p-1">
    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-blue-300 border border-white/10 shrink-0">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-sm font-bold tracking-tight ${isHigh ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

const ActionCard = ({ icon, title, sub, label, onClick, color }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200 border border-white flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-all duration-300"
  >
    <div className={`w-20 h-20 mb-6 rounded-[28px] flex items-center justify-center bg-${color}-50 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>{icon}</div>
    <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight mb-1">{title}</h3>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{sub}</p>
    <span className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${color === 'orange' ? 'border-orange-100 text-orange-500 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white' : 'border-green-100 text-green-600 bg-green-50 group-hover:bg-green-600 group-hover:text-white'}`}>
      {label}
    </span>
  </div>
);

export default WorkerApp;