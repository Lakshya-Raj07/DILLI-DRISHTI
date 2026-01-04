import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, ShieldAlert, IndianRupee, Camera, 
  Activity, History, X, CheckCircle2, 
  User, Briefcase, Map, ShieldCheck, Upload, LogOut 
} from 'lucide-react';

const WorkerApp = () => {
  // Real dynamic data states
  const [employeeId] = useState(1); // Pehle worker ki ID
  const [workerData, setWorkerData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // New States for Timer Logic
  const [timeLeft, setTimeLeft] = useState(null);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);

  // 1. Fetch Worker Profile Dynamically
  const fetchWorkerProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/worker/${employeeId}`);
      setWorkerData(res.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  // 2. Auto-Polling (Live Alert Every 10 Seconds)
  useEffect(() => {
    fetchWorkerProfile(); // Initial load
    const pollInterval = setInterval(fetchWorkerProfile, 10000);
    return () => clearInterval(pollInterval);
  }, [employeeId]);

  // 3. 10-Minute Countdown Logic
  useEffect(() => {
    let timer;
    if (workerData?.is_ping_active && workerData?.ping_start_time) {
      const calculateTimeLeft = () => {
        const startTime = new Date(workerData.ping_start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = 600 - elapsedSeconds; // 10 minutes total

        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
        } else {
          setTimeLeft(remaining);
        }
      };

      calculateTimeLeft(); // Initial calculation
      timer = setInterval(calculateTimeLeft, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [workerData]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for dynamic timer color
  const getTimerColor = (seconds) => {
    if (seconds > 300) return 'text-green-500'; // Above 5 min
    if (seconds > 120) return 'text-yellow-500'; // 2-5 min
    return 'text-red-600 animate-pulse'; // Below 2 min
  };

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
        setStatus({ type: 'success', message: "Attendance Marked Successfully!" });
        fetchWorkerProfile();
      } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.error || "Verification Failed!" });
      }
      setLoading(false);
    }, () => {
      setStatus({ type: 'error', message: "GPS Location Error" });
      setLoading(false);
    });
  };

  // Random Ping Response Logic
  const handlePingResponse = () => {
    if (!workerData?.is_ping_active) {
      return alert('No active ping signal detected. Relax, you are on duty!');
    }
    if (timeLeft <= 0) {
      return alert('TIMEOUT! You missed the response window. Penalty reported to Supervisor.');
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await axios.post('http://localhost:5000/api/ping/respond', {
          employee_id: employeeId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setStatus({ type: 'success', message: res.data.message });
        fetchWorkerProfile();
      } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.error || "Ping Verification failed!" });
      } finally {
        setLoading(false);
      }
    }, () => {
      setStatus({ type: 'error', message: "GPS Access Denied" });
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
      setStatus({ type: 'success', message: "Salary released successfully!" });
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
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tight">{workerData?.name}</h3>
          <p className="text-orange-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">Field Operations</p>
        </div>

        <div className="space-y-4 flex-1">
          <DetailRow icon={<User size={16}/>} label="Service ID" value={`#MCD-2026-00${workerData?.id}`} />
          <DetailRow icon={<Map size={16}/>} label="Assigned Ward" value={workerData?.ward_name} />
          <DetailRow icon={<Activity size={16}/>} label="Integrity Index" value={`${workerData?.integrity_score}%`} isHigh={workerData?.integrity_score > 90} />
          
          <div className="p-5 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[28px] mt-6">
            <p className="text-[9px] font-black text-blue-300 uppercase mb-1 tracking-widest">Pay Ledger</p>
            <p className="text-2xl font-black text-white">₹ {workerData?.base_salary?.toLocaleString()}</p>
          </div>
        </div>
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

        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-xl border border-white text-center relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Geo-Verification</h2>
          <div className="bg-blue-50 p-6 rounded-[32px] border-2 border-dashed border-blue-100 max-w-md mx-auto mb-10">
               <p className="text-xl font-black text-[#1A2B4C] uppercase">{workerData?.ward_name}</p>
               <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Live GPS Lock Active</p>
          </div>

          <button 
            onClick={handleAttendance}
            disabled={loading}
            className="w-full max-w-lg py-6 bg-[#1A2B4C] hover:bg-slate-800 text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 mx-auto"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><MapPin className="text-orange-500" /> Punch Attendance</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ActionCard 
            icon={<ShieldAlert className={workerData?.is_ping_active ? "text-red-500 animate-pulse" : "text-orange-500"} />} 
            title="Random Ping" 
            sub={workerData?.is_ping_active ? "Action Window Open" : "Auth Prompt Check"} 
            label={timeLeft === 0 ? "TIMEOUT" : (loading ? "Verifying..." : "Respond Now")} 
            onClick={handlePingResponse}
            color={workerData?.is_ping_active ? "red" : "orange"}
            isPingActive={workerData?.is_ping_active}
            timeLeft={timeLeft}
            formatTime={formatTime}
            getTimerColor={getTimerColor}
          />
          <ActionCard 
            icon={<IndianRupee className="text-green-600" />} 
            title="Salary Vault" 
            sub="Secure OTP Access" 
            label="Release Payout" 
            onClick={() => setShowOtpModal(true)}
            color="green"
          />
        </div>
      </main>

      {/* 3. OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2B4C]/95 backdrop-blur-xl">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-orange-500 p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-3 rounded-2xl"><IndianRupee size={28} /></div>
                <button onClick={() => setShowOtpModal(false)}><X size={24} /></button>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Vault Release</h3>
            </div>
            <div className="p-10 text-center">
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
                    className="w-12 h-16 border-2 border-slate-100 bg-slate-50 rounded-2xl text-center text-2xl font-black text-[#1A2B4C] outline-none"
                  />
                ))}
              </div>
              <button 
                onClick={verifySalaryOtp}
                disabled={verifyingOtp || otp.includes('')}
                className="w-full py-5 bg-[#1A2B4C] text-white rounded-[24px] font-black uppercase tracking-[0.2em]"
              >
                {verifyingOtp ? "Authenticating..." : "Unlock Bank Transfer"}
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
    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold ${isHigh ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

const ActionCard = ({ icon, title, sub, label, onClick, color, isPingActive, timeLeft, formatTime, getTimerColor }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-8 rounded-[40px] shadow-xl border border-white flex flex-col items-center text-center group cursor-pointer transition-all duration-300 
      ${isPingActive && timeLeft > 0 ? 'ring-4 ring-red-500/50 animate-bounce-subtle shadow-red-100' : ''}`}
  >
    <div className={`w-20 h-20 mb-6 rounded-[28px] flex items-center justify-center bg-${color}-50 shadow-inner`}>{icon}</div>
    
    {isPingActive && timeLeft !== null && (
      <div className={`mb-4 font-black text-3xl tracking-tighter ${getTimerColor(timeLeft)}`}>
        {formatTime(timeLeft)}
      </div>
    )}

    <h3 className="text-xl font-black text-[#1A2B4C] uppercase mb-1">{title}</h3>
    <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${isPingActive && timeLeft > 0 ? 'text-red-600' : 'text-slate-400'}`}>{sub}</p>
    
    <span className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all 
      ${timeLeft === 0 ? 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed' : 
        color === 'red' ? 'border-red-100 text-red-500 bg-red-50 group-hover:bg-red-500 group-hover:text-white' : 
        color === 'orange' ? 'border-orange-100 text-orange-500 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white' : 
        'border-green-100 text-green-600 bg-green-50 group-hover:bg-green-600 group-hover:text-white'}`}>
      {label}
    </span>
  </div>
);

export default WorkerApp;