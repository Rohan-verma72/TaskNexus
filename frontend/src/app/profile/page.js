"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Edit3, Save, Camera } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState({ fullName: "", email: "", role: "", joined: "" });
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setUser({
      fullName: localStorage.getItem("userName") || "Unknown User",
      email: localStorage.getItem("userEmail") || "user@tasknexus.app",
      role: localStorage.getItem("userRole") || "Developer",
      joined: "Jan 2026"
    });
    setNewName(localStorage.getItem("userName") || "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("userName", newName);
    setUser({ ...user, fullName: newName });
    setEditing(false);
    window.location.reload(); // Refresh to update layout avatar
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="d-flex align-items-center justify-content-between mb-5">
         <div>
            <h1 className="display-6 fw-black text-white mb-2">My Profile</h1>
            <p className="text-secondary mb-0">Manage your identity and authentication status.</p>
         </div>
      </div>

      <div className="row g-5">
         <div className="col-12 col-xl-4 text-center">
            <div className="glass-panel p-5 d-flex flex-column align-items-center gap-4 border-info border-opacity-10 shadow-lg">
               <div className="position-relative">
                  <div className="avatar bg-gradient-to-br from-primary to-info p-1 rounded-circle shadow-2xl cursor-pointer" style={{ width: 140, height: 140 }}>
                     <div className="w-100 h-100 rounded-circle bg-dark d-flex align-items-center justify-content-center text-white display-3 fw-bold border border-secondary border-opacity-10">
                        {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                     </div>
                  </div>
                  <button className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle p-2 shadow-lg border-2 border-dark">
                     <Camera size={20} />
                  </button>
               </div>
               <div>
                  <h3 className="fw-black text-white mb-1">{user.fullName}</h3>
                  <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 px-3 rounded-pill uppercase tracking-widest" style={{ fontSize: 10 }}>{user.role}</span>
               </div>
            </div>
         </div>

         <div className="col-12 col-xl-8">
            <div className="glass-panel p-5 h-100 shadow-xl border-secondary border-opacity-10">
               <div className="d-flex align-items-center justify-content-between mb-5 pb-3 border-bottom border-secondary border-opacity-10">
                  <h5 className="fw-black text-white mb-0 text-uppercase tracking-widest" style={{ fontSize: 12 }}>Personal Parameters</h5>
                  <button 
                    className="btn btn-link text-warning p-0 text-decoration-none d-flex align-items-center gap-2 fw-bold" 
                    onClick={() => editing ? handleSave() : setEditing(true)}
                  >
                     {editing ? <><Save size={18} /> Save Identity</> : <><Edit3 size={18} /> Modify Identity</>}
                  </button>
               </div>

               <div className="row g-5">
                  <div className="col-md-6">
                     <label className="small text-uppercase tracking-widest font-black text-muted mb-3 d-block" style={{ fontSize: 10 }}>Full Name</label>
                     {editing ? (
                        <input 
                           type="text" 
                           className="form-control bg-dark border-secondary border-opacity-25 text-white p-3 rounded-4" 
                           value={newName} 
                           onChange={e => setNewName(e.target.value)}
                        />
                     ) : (
                        <div className="d-flex align-items-center gap-3 text-white">
                           <User size={20} className="text-primary" />
                           <span className="fw-bold fs-5">{user.fullName}</span>
                        </div>
                     )}
                  </div>

                  <div className="col-md-6">
                     <label className="small text-uppercase tracking-widest font-black text-muted mb-3 d-block" style={{ fontSize: 10 }}>Email Protocol</label>
                     <div className="d-flex align-items-center gap-3 text-white">
                        <Mail size={20} className="text-secondary" />
                        <span className="fw-bold fs-5">{user.email}</span>
                     </div>
                  </div>

                  <div className="col-md-6">
                     <label className="small text-uppercase tracking-widest font-black text-muted mb-3 d-block" style={{ fontSize: 10 }}>Access Clearance</label>
                     <div className="d-flex align-items-center gap-3 text-white">
                        <Shield size={20} className="text-info" />
                        <span className="fw-bold fs-5">{user.role}</span>
                     </div>
                  </div>

                  <div className="col-md-6">
                     <label className="small text-uppercase tracking-widest font-black text-muted mb-3 d-block" style={{ fontSize: 10 }}>Node Since</label>
                     <div className="d-flex align-items-center gap-3 text-white">
                        <Calendar size={20} className="text-warning" />
                        <span className="fw-bold fs-5">{user.joined}</span>
                     </div>
                  </div>
               </div>

               <div className="mt-5 pt-5 border-top border-secondary border-opacity-10">
                  <button className="btn btn-outline-danger px-5 py-3 rounded-4 w-100 d-flex align-items-center justify-content-center gap-3 border-danger border-opacity-25">
                     Request Account Deletion Protocol
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
