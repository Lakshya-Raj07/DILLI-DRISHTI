import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MapPin, ShieldAlert, IndianRupee, Camera, Activity, History, X, CheckCircle2 } from 'lucide-react';

const WorkerApp = () => {
  const [employeeId] = useState(1); // Rajesh Kumar
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 1. New States for OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);

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
      } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.reason || "Verification Failed!" });
      }
      setLoading(false);
    }, () => {
      setStatus({ type: 'error', message: "GPS Location Error" });
      setLoading(false);
    });
  };

  // 2. OTP Input Logic (Handles 6 boxes focus)
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // 3. Backend Call for Salary Verification
  const verifySalaryOtp = async () => {
    setVerifyingOtp(true);
    try {
      const finalOtp = otp.join('');
      const res = await axios.post('http://localhost:5000/api/salary/verify', {
        employee_id: employeeId,
        otp: finalOtp
      });
      setStatus({ type: 'success', message: "Salary Verification Successful!" });
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP entered!");
    }
    setVerifyingOtp(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 min-h-screen bg-gray-50">
      
      {/* Page Heading */}
      <div className="flex justify-between items-end border-b-4 border-orange-500 pb-2">
        <h2 className="text-3xl font-black text-[#002147] uppercase tracking-tighter italic">Field Staff Self-Service Portal</h2>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest hidden md:block">MCD Employee ID: #MCD-10026</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-2 border-gray-200 shadow-2xl rounded-lg overflow-hidden transform hover:scale-[1.01] transition-all">
            <div className="bg-[#002147] p-8 text-center text-white relative">
              <div className="absolute top-2 right-2 opacity-20"><ShieldAlert size={40}/></div>
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-white bg-gray-100 p-1 mb-4 overflow-hidden shadow-lg">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" className="rounded-full" alt="profile" />
                </div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Rajesh Kumar</h3>
              <p className="text-xs font-bold text-orange-400 tracking-[0.2em] uppercase">Sanitation Division | Ward 54</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-gray-500 font-bold uppercase">Base Salary:</span>
                <span className="text-[#002147] font-black font-mono">₹ 28,500.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {status && (
            <div className={`p-4 rounded-lg border-l-8 shadow-md flex items-center justify-between animate-bounce ${status.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
               <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
               {status.type === 'success' ? <CheckCircle2 size={20}/> : <ShieldAlert size={20}/>}
            </div>
          )}

          {/* Main Attendance Card */}
          <div className="bg-white border-2 border-gray-200 shadow-xl rounded-lg p-8 text-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 underline decoration-orange-500 underline-offset-4">Mandatory Geofence Verification</h4>
            <div className="mb-8 p-6 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
               <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Assigned Deployment Area</p>
               <p className="text-xl font-black text-[#002147] uppercase">WARD 54 - ROHINI (1000m Radius)</p>
            </div>

            <button 
              onClick={handleAttendance}
              disabled={loading}
              className="px-12 py-5 bg-[#002147] hover:bg-blue-900 text-white rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-4 shadow-2xl active:scale-95 transition-all mx-auto w-full"
            >
              <MapPin size={24} className="text-orange-500" />
              <span>{loading ? "SYNCING COORDINATES..." : "PUNCH ATTENDANCE"}</span>
            </button>
          </div>

          {/* Utility Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg flex items-center justify-between hover:border-orange-500 transition-all cursor-pointer group">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Verification</p>
                  <p className="text-lg font-black text-[#002147]">RANDOM PING RESPONSE</p>
               </div>
               <ShieldAlert size={32} className="text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Financial Portal Trigger */}
            <div 
              onClick={() => setShowOtpModal(true)}
              className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg flex items-center justify-between hover:border-green-500 transition-all cursor-pointer group"
            >
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Portal</p>
                  <p className="text-lg font-black text-[#002147]">OTP SALARY VERIFICATION</p>
               </div>
               <IndianRupee size={32} className="text-green-600 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SALARY VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002147]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Secure Payout Access</h3>
                <p className="text-[10px] font-bold uppercase opacity-80">Enter 6-digit verification code</p>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 border-2 border-gray-200 rounded-lg text-center text-xl font-black text-[#002147] focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={verifySalaryOtp}
                  disabled={verifyingOtp || otp.includes('')}
                  className="w-full py-4 bg-[#002147] text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-50 hover:bg-blue-900 transition-colors shadow-lg"
                >
                  {verifyingOtp ? "VERIFYING..." : "CONFIRM & RELEASE SALARY"}
                </button>
                <p className="text-center text-[9px] text-gray-400 font-bold uppercase">
                  A verification code has been sent to your registered mobile ending in *5526
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerApp;