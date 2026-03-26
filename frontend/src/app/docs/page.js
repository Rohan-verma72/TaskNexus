"use client";

import { BookOpen, HelpCircle, Activity, LayoutDashboard, FolderKanban, TrendingUp, Users, Settings as SettingsIcon, ShieldCheck, Mail, Key, Zap } from "lucide-react";

export default function Docs() {
  return (
    <div className="animate-in slide-in-from-bottom duration-500">
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">Manual.</h1>
             <p className="text-secondary mb-0">Platform documentation and engineering workflow guidelines.</p>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-lg"><HelpCircle size={18} /> Support Hub</button>
       </div>

       <div className="row g-4">
          <div className="col-12 col-xl-8">
             <div className="stat-card glass-panel p-5 border-primary border-opacity-10 shadow-lg mb-4">
                <div className="d-flex align-items-center gap-3 mb-5">
                   <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 shadow-lg"><BookOpen size={24} /></div>
                   <h5 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 13 }}>Operational Guidelines</h5>
                </div>

                <div className="mb-5">
                   <h6 className="fw-black text-white text-uppercase tracking-widest mb-3 d-flex align-items-center gap-2" style={{ fontSize: 11 }}><LayoutDashboard size={14} className="text-primary" /> 01. Interstellar Dashboard</h6>
                   <p className="text-secondary small leading-relaxed" style={{ fontSize: 13, lineHeight: '1.8' }}>
                      Navigate to the root directory `/` to access the primary task monitoring hub. Utilize the **drag-and-drop** engine to synchronize task states across multi-functional columns. Real-time stats provide a high-fidelity overview of node velocity.
                   </p>
                </div>

                <div className="mb-5">
                   <h6 className="fw-black text-white text-uppercase tracking-widest mb-3 d-flex align-items-center gap-2" style={{ fontSize: 11 }}><FolderKanban size={14} className="text-info" /> 02. Flux Projects</h6>
                   <p className="text-secondary small leading-relaxed" style={{ fontSize: 13, lineHeight: '1.8' }}>
                      Clusters allow for project-level task grouping. Create a workspace to orchestrate complex engineering workflows and manage team-specific node assignments. Each project tracks its own performance metrics independently.
                   </p>
                </div>

                <div className="mb-0">
                   <h6 className="fw-black text-white text-uppercase tracking-widest mb-3 d-flex align-items-center gap-2" style={{ fontSize: 11 }}><TrendingUp size={14} className="text-success" /> 03. Performance Metrics</h6>
                   <p className="text-secondary small leading-relaxed" style={{ fontSize: 13, lineHeight: '1.8' }}>
                      Strategic review is enabled through the Metrics dashboard. Analyze completion rates and risk factors using high-resolution charts. The global audit sequence provides a detailed transaction log of all system events.
                   </p>
                </div>
             </div>
          </div>

          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
             <div className="stat-card glass-panel p-4 border-info border-opacity-10 shadow-lg">
                <h6 className="fw-black text-white mb-4 uppercase tracking-widest d-flex align-items-center gap-2" style={{ fontSize: 11 }}><Zap size={14} className="text-primary" /> Rapid Access</h6>
                <div className="d-flex flex-column gap-3">
                   <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark bg-opacity-25 border border-secondary border-opacity-10">
                      <span className="small text-secondary fw-bold" style={{ fontSize: 10 }}>Dashboard</span>
                      <span className="badge bg-primary px-2 font-bold uppercase" style={{ fontSize: 8 }}>CMD + D</span>
                   </div>
                   <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark bg-opacity-25 border border-secondary border-opacity-10">
                      <span className="small text-secondary fw-bold" style={{ fontSize: 10 }}>New Task</span>
                      <span className="badge bg-primary px-2 font-bold uppercase" style={{ fontSize: 8 }}>ALT + N</span>
                   </div>
                   <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark bg-opacity-25 border border-secondary border-opacity-10">
                      <span className="small text-secondary fw-bold" style={{ fontSize: 10 }}>Reports</span>
                      <span className="badge bg-primary px-2 font-bold uppercase" style={{ fontSize: 8 }}>CMD + R</span>
                   </div>
                </div>
             </div>

             <div className="stat-card glass-panel p-4 border-success border-opacity-10 shadow-lg mt-auto text-center">
                <div className="p-3 rounded-4 bg-success bg-opacity-10 text-success border border-success border-opacity-25 shadow-lg d-inline-flex mb-4"><ShieldCheck size={28} /></div>
                <h6 className="fw-black text-white mb-2 uppercase tracking-widest" style={{ fontSize: 11 }}>System Health</h6>
                <p className="text-secondary small mb-4" style={{ fontSize: 12 }}>Core engine running v4.0.2 with zero latency detected across all node clusters.</p>
                <button className="btn btn-primary w-100 btn-sm fw-bold py-2 shadow-lg">Run Diagnostics</button>
             </div>
          </div>
       </div>
    </div>
  );
}
