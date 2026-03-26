"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FolderKanban, Users, ClipboardList, Plus, Search, MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";

import API from '@/config/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/projects`);
      if (res.ok) setProjects(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setShowModal(false);
        setNewProject({ name: "", description: "" });
        fetchProjects();
      }
    } catch (e) { console.error(e); }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
       <div className="d-flex flex-column align-items-center justify-content-center py-5 translate-y-20">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="mt-3 text-muted">Indexing project clusters...</p>
       </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">Clusters.</h1>
             <p className="text-secondary mb-0">Project-level containers for global task orchestration.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-lg"><Plus size={18} /> New Project</button>
       </div>

       <div className="position-relative mb-5">
          <Search size={16} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
          <input type="text" placeholder="Filter workspaces..." className="form-control bg-dark bg-opacity-25 border-secondary border-opacity-10 text-white ps-5 py-3 rounded-4" value={search} onChange={e => setSearch(e.target.value)} />
       </div>

       <div className="row g-4 mb-5">
          {filtered.map(p => (
             <div key={p.projectId} className="col-12 col-md-6 col-xl-4 text-decoration-none">
                <Link href={`/projects/${p.projectId}`} className="stat-card glass-panel h-100 p-5 d-flex flex-column hover-scale cursor-pointer border-primary border-opacity-10 text-decoration-none">
                   <div className="d-flex justify-content-between align-items-center mb-4 text-decoration-none">
                      <div className="p-3 rounded-4 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 shadow-lg text-decoration-none"><FolderKanban size={24} /></div>
                      <button className="btn btn-link text-muted p-0 border-0"><MoreVertical size={18} /></button>
                   </div>
                   <h5 className="fw-black text-white mb-2 fs-4">{p.name}</h5>
                   <p className="text-secondary small line-clamp-2 flex-grow-1" style={{ fontSize: 13, lineHeight: '1.6' }}>{p.description || "Project parameters defined by administrative requirements."}</p>
                   
                   <div className="mt-5 pt-4 border-top border-secondary border-opacity-10 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                         <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 10 }}>
                            <ClipboardList size={14} />
                            <span className="fw-bold tracking-widest text-uppercase">{p.tasks?.length || 0} tasks</span>
                         </div>
                         <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 10 }}>
                            <Users size={14} />
                            <span className="fw-bold tracking-widest text-uppercase">{p.projectMembers?.length || 0} members</span>
                         </div>
                      </div>
                      <div className="progress overflow-visible bg-dark rounded-pill" style={{ width: 60, height: 6 }}>
                         <div className="progress-bar bg-warning rounded-pill shadow-lg" style={{ width: '45%' }}></div>
                      </div>
                   </div>
                </Link>
             </div>
          ))}
       </div>

       {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
             <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content glass-panel border-primary border-opacity-25 shadow-2xl animate-in zoom-in duration-300">
                   <div className="modal-header border-secondary border-opacity-10 p-4">
                      <h5 className="modal-title fw-black text-white tracking-tighter">NEW PROJECT.</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                   </div>
                   <form onSubmit={handleCreateProject}>
                      <div className="modal-body p-4">
                         <div className="mb-4">
                            <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Project Title</label>
                            <input type="text" className="form-control bg-dark text-white border-secondary border-opacity-25 py-2 px-3" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="Project cluster name..." />
                         </div>
                         <div>
                            <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Mission Description</label>
                            <textarea className="form-control bg-dark text-white border-secondary border-opacity-25 py-2 px-3" rows="3" required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Describe the cluster objectives..."></textarea>
                         </div>
                      </div>
                      <div className="modal-footer border-secondary border-opacity-10 p-4">
                         <button type="button" className="btn btn-outline-secondary px-4 py-2 border-opacity-25" onClick={() => setShowModal(false)}>Cancel</button>
                         <button type="submit" className="btn btn-primary px-4 py-2">Create Cluster</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
