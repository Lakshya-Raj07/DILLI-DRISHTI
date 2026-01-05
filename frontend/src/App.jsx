import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// Pages Import
import Login from './pages/Login';
import CommissionerDashboard from './pages/CommissionerDashboard';
import ZonalDashboard from './pages/ZonalDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import WorkerApp from './pages/WorkerApp';

/**
 * 1. Protected Route Component
 */
const ProtectedRoute = ({ children, userRole }) => {
  if (!userRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // INSTRUCTION: Session Recovery Logic (Prevents white screen on refresh)
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user_session');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserRole(user.role);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col">
      <div className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] h-1.5 shrink-0"></div>
      
      <header className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-14" />
          <div className="border-l-2 border-gray-300 pl-4">
            <h1 className="text-[#002147] font-black text-xl uppercase leading-tight tracking-tighter">Municipal Corporation of Delhi</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Government of NCT of Delhi</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-[10px] font-black text-[#002147] uppercase tracking-widest">
          {!userRole ? (
            <span className="text-gray-400 italic font-bold">Awaiting Secure Authentication...</span>
          ) : (
            <>
              {userRole === 'admin' && <Link to="/admin" className="hover:text-blue-700 transition-all">Admin HQ</Link>}
              {userRole === 'zonal' && <Link to="/zonal" className="hover:text-blue-700 transition-all">Zonal Office</Link>}
              {userRole === 'supervisor' && <Link to="/supervisor" className="hover:text-blue-700 transition-all">Supervisor</Link>}
              {userRole === 'worker' && <Link to="/worker" className="text-orange-600 hover:text-orange-700 transition-all">Field Staff</Link>}
              
              <button 
                onClick={() => { 
                  setUserRole(null); 
                  sessionStorage.removeItem('user_session'); // Clear session on logout
                  navigate('/'); 
                }} 
                className="ml-4 px-4 py-1.5 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-600 hover:text-white transition-all uppercase text-[9px]"
              >
                Logout Session
              </button>
            </>
          )}
        </nav>
      </header>

      <div className="bg-[#002147] text-white px-10 py-2 text-[10px] font-bold flex justify-between items-center tracking-widest uppercase shrink-0">
        <span className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${userRole ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span> 
          Status: {userRole ? `Authenticated [${userRole}]` : 'System Locked'}
        </span>
        <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Login setUserRole={setUserRole} />} />
          
          <Route path="/admin" element={
            <ProtectedRoute userRole={userRole}>
              <CommissionerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/zonal" element={
            <ProtectedRoute userRole={userRole}>
              <ZonalDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/supervisor" element={
            <ProtectedRoute userRole={userRole}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/worker" element={
            <ProtectedRoute userRole={userRole}>
              <WorkerApp />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="text-center py-6 border-t border-gray-200 text-[9px] text-gray-400 font-bold uppercase tracking-widest shrink-0">
        Dilli Drishti v2.0 | Security Protocol: AES-256 Enabled | © 2026 MCD
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;