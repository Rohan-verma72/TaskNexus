"use client";

import { User, Shield, Bell, Database, LogOut, Settings as SettingsIcon, ShieldCheck, Mail, Key } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [user, setUser] = useState({ name: 'User', id: 'Not Logged In', role: 'Developer' });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser({
        name: localStorage.getItem("userName") || 'User',
        id: localStorage.getItem("userId") || 'Not Logged In',
        role: localStorage.getItem("userRole") || 'Developer'
      });
    }
  }, []);

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">Protocol.</h1>
             <p className="text-secondary mb-0">System preferences and workspace security parameters.</p>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-lg"><SettingsIcon size={18} /> Update Workspace</button>
       </div>

       <div className="row g-4">
          <div className="col-12 col-xl-8">
             <div className="stat-card glass-panel p-5 border-info border-opacity-10 shadow-lg h-100">
                <div className="d-flex align-items-center gap-3 mb-5">
                   <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 shadow-lg"><User size={24} /></div>
                   <h5 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 13 }}>Administrative Profile</h5>
                </div>

                <div className="row g-4">
                   <div className="col-12 col-md-6">
                      <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Identity Identifier</label>
                      <div className="p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-10 text-white rounded-4 fw-bold">{user.name}</div>
                   </div>
                   <div className="col-12 col-md-6">
                      <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Assigned Node Role</label>
                      <div className="p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-10 text-info rounded-4 fw-bold uppercase tracking-widest d-flex align-items-center gap-2" style={{ fontSize: 9 }}><ShieldCheck size={14} /> {user.role}</div>
                   </div>
                   <div className="col-12 mt-4">
                      <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Backend UUID Authentication Token</label>
                      <div className="p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-10 text-muted rounded-4 font-monospace shadow-inner cursor-default" style={{ fontSize: 11 }}>{user.id}</div>
                   </div>
                </div>

                <div className="mt-5 pt-5 border-top border-secondary border-opacity-10 d-flex gap-3">
                   <button className="btn btn-outline-primary px-4 py-2 rounded-4 fw-bold shadow-lg" style={{ fontSize: 11 }}>Synchronize Account</button>
                   <button className="btn btn-outline-danger px-4 py-2 rounded-4 fw-bold d-flex align-items-center gap-2" style={{ fontSize: 11 }}><LogOut size={14} /> Revoke Session</button>
                </div>
             </div>
          </div>

          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
             <div className="stat-card glass-panel p-4 border-warning border-opacity-10 shadow-lg">
                <div className="d-flex align-items-center gap-3 mb-4">
                   <div className="p-3 rounded-4 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 shadow-lg"><Shield size={20} /></div>
                   <h6 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 11 }}>Security Audit</h6>
                </div>
                <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>Two-factor authentication and session management for enhanced security posture.</p>
                <div className="d-flex flex-column gap-2">
                   <button className="btn btn-dark w-100 d-flex align-items-center justify-content-between p-3 rounded-4 border-secondary border-opacity-10 text-white" style={{ fontSize: 11 }}>
                      <span className="fw-bold tracking-widest uppercase">MFA Configuration</span>
                      <Shield size={14} className="text-warning" />
                   </button>
                   <button className="btn btn-dark w-100 d-flex align-items-center justify-content-between p-3 rounded-4 border-secondary border-opacity-10 text-white" style={{ fontSize: 11 }}>
                      <span className="fw-bold tracking-widest uppercase">RSA Key Management</span>
                      <Key size={14} className="text-primary" />
                   </button>
                </div>
             </div>

             <div className="stat-card glass-panel p-4 border-emerald border-opacity-10 shadow-lg mt-auto">
                <div className="d-flex align-items-center gap-3 mb-4">
                   <div className="p-3 rounded-4 bg-success bg-opacity-10 text-success border border-success border-opacity-25 shadow-lg"><Bell size={20} /></div>
                   <h6 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 11 }}>Alert Logic</h6>
                </div>
                <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>Configure real-time push and email notifications for critical task overflows.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
