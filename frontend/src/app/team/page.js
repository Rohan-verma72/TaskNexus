"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Shield, UserPlus, Search, MoreHorizontal, Trash2, ShieldCheck, ShieldAlert, Loader2, CheckSquare } from "lucide-react";
import AssignTaskModal from '@/components/AssignTaskModal';

import API from '@/config/api';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetUserId, setAssignTargetUserId] = useState(null);
  const [assignTargetUserName, setAssignTargetUserName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/users`);
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setCurrentUser(localStorage.getItem('userId'));
    const role = localStorage.getItem('userRole');
    setCurrentUserRole(role);
    console.log('[TeamPage] userRole from localStorage:', role);
  }, []);

  const openAssignModal = (id, name) => { setAssignTargetUserId(id); setAssignTargetUserName(name); setAssignModalOpen(true); };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to revoke access?')) return;
    await fetch(`${API}/auth/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  if (loading) {
    return (
       <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="mt-3 text-muted">Synchronizing team credentials...</p>
       </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">Personnel.</h1>
             <p className="text-secondary mb-0">Role-based access control and team node management.</p>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-lg"><UserPlus size={18} /> Add Operative</button>
       </div>

       <div className="glass-panel p-5 border-primary border-opacity-10 shadow-lg position-relative overflow-hidden">
          <div className="d-flex align-items-center justify-content-between mb-5">
             <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 shadow-lg"><Users size={24} /></div>
                <h5 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 13 }}>Engineering Core Unit</h5>
             </div>
             <div className="position-relative d-none d-md-block" style={{ width: 300 }}>
                <Search size={16} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                <input 
                   type="text" 
                   placeholder="Search operatives..." 
                   className="form-control bg-dark bg-opacity-25 border-secondary border-opacity-10 text-white ps-5 py-2 rounded-pill" 
                   style={{ fontSize: 12 }} 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="table-responsive">
             <table className="table table-dark table-hover border-transparent align-middle">
                <thead>
                   <tr className="border-secondary border-opacity-10">
                      <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Full Identity</th>
                      <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Secure Email</th>
                      <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Node Role</th>
                      <th className="fw-bold tracking-widest text-uppercase py-4 text-end" style={{ fontSize: 10, color: '#475569' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {users.filter(u => 
                      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
                   ).map(u => (
                      <tr key={u.id} className="border-secondary border-opacity-5">
                         <td className="py-4">
                            <div className="d-flex align-items-center gap-3">
                               <div className="avatar px-1 py-1 rounded-circle bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: 40, height: 40, fontSize: 13 }}>{u.fullName?.substring(0, 1)}</div>
                               <div>
                                  <div className="fw-bold text-white mb-0">{u.fullName} {u.id === currentUser && <span className="badge bg-primary bg-opacity-10 text-primary ms-2 px-2" style={{ fontSize: 8 }}>YOU</span>}</div>
                                  <div className="text-secondary small font-bold" style={{ fontSize: 9 }}>UID: {u.id?.substring(0, 8)}</div>
                               </div>
                            </div>
                         </td>
                         <td>
                            <div className="text-secondary small font-bold" style={{ fontSize: 11 }}>{u.email}</div>
                         </td>
                         <td>
                            <div className="d-flex align-items-center gap-2">
                               {u.role === 'Admin' ? <ShieldAlert size={14} className="text-danger" /> : <ShieldCheck size={14} className="text-primary" />}
                               <span className={`badge border px-3 rounded-pill bg-dark bg-opacity-25 font-bold uppercase tracking-widest ${u.role === 'Admin' ? 'text-danger border-danger border-opacity-25' : (u.role === 'Manager' ? 'text-warning border-warning border-opacity-25' : 'text-primary border-primary border-opacity-25')}`} style={{ fontSize: 9 }}>
                                  {u.role}
                               </span>
                            </div>
                         </td>
                          <td className="text-end">
                             <div className="d-flex justify-content-end gap-2">
                                <button
                                   onClick={() => openAssignModal(u.id, u.fullName)}
                                   className="btn btn-primary btn-sm px-3 rounded-pill fw-black d-flex align-items-center gap-2 shadow-sm"
                                   style={{ fontSize: 9 }}
                                >
                                   <CheckSquare size={12} /> Assign
                                </button>
                                <button className="btn btn-dark p-2 rounded-3 border-secondary border-opacity-10 text-muted"><MoreHorizontal size={16} /></button>
                               {u.id !== currentUser && (
                                  <button onClick={() => deleteUser(u.id)} className="btn btn-dark p-2 rounded-3 border-secondary border-opacity-10 text-danger hover-bg-danger hover-text-white"><Trash2 size={16} /></button>
                               )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        <AssignTaskModal 
           isOpen={assignModalOpen} 
           onClose={() => setAssignModalOpen(false)} 
           userId={assignTargetUserId}
           userName={assignTargetUserName}
           onSave={() => { fetchUsers(); window.dispatchEvent(new CustomEvent('task-updated')); }}
        />
     </div>
    </div>
  );
}
