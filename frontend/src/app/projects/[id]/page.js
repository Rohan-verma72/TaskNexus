"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, User, MoreVertical, ChevronLeft, Layout, Send } from "lucide-react";
import Link from "next/link";

import API from '@/config/api';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Task Form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: 2,
    assigneeId: "",
    dueDate: ""
  });

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setTasks(data.tasks || []);
      }
    } catch (e) { console.error(e); }
  }, [id]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/users`);
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, [fetchProject, fetchUsers]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const taskPayload = { 
      Title: newTask.title,
      Description: newTask.description,
      Priority: newTask.priority,
      AssigneeId: newTask.assigneeId || null,
      DueDate: newTask.dueDate || null,
      ProjectId: parseInt(id)
    };
    if (!taskPayload.DueDate) delete taskPayload.DueDate;
    if (!taskPayload.AssigneeId) delete taskPayload.AssigneeId;

    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload)
      });
      if (res.ok) {
        setShowModal(false);
        setNewTask({ title: "", description: "", priority: 2, assigneeId: "", dueDate: "" });
        fetchProject();
      }
    } catch (e) { console.error(e); }
  };

  const getPriorityBadge = (p) => {
    switch(p) {
      case 3: return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill small">High</span>;
      case 2: return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 rounded-pill small">Medium</span>;
      default: return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 rounded-pill small">Low</span>;
    }
  };

  const getStatusIcon = (s) => {
    switch(s) {
      case 3: return <CheckCircle2 size={18} className="text-success" />;
      case 4: return <AlertTriangle size={18} className="text-danger" />;
      case 2: return <Clock size={18} className="text-warning animate-pulse" />;
      default: return <Circle size={18} className="text-muted" />;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-black text-white">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (!project) return <div className="p-5 text-center text-white">Project not found.</div>;

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
      <Link href="/projects" className="btn btn-link text-secondary p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none hover-white">
        <ChevronLeft size={16} /> Back to Projects
      </Link>

      <div className="glass-panel p-5 mb-5 border-warning border-opacity-10 shadow-2xl">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="display-4 fw-black text-white mb-2">{project.name}</h1>
            <p className="text-light-muted fs-5 opacity-75">{project.description}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow-lg">
            <Plus size={18} /> New Sub-task
          </button>
        </div>
        
        <div className="d-flex gap-4 text-muted small mt-4">
           <div className="d-flex align-items-center gap-2">
              <Layout size={14} className="text-warning" />
              <span className="fw-bold tracking-widest text-uppercase" style={{ fontSize: 10 }}>{tasks.length} sub-tasks</span>
           </div>
           <div className="d-flex align-items-center gap-2">
              <User size={14} className="text-warning" />
              <span className="fw-bold tracking-widest text-uppercase" style={{ fontSize: 10 }}>Project Cluster ID: {id}</span>
           </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="glass-panel p-0 overflow-hidden border-secondary border-opacity-10 shadow-xl">
            <div className="p-4 bg-white bg-opacity-5 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-white tracking-widest text-uppercase small" style={{ fontSize: 11 }}>Orbital Task Matrix</h5>
              <div className="d-flex gap-2">
                 <span className="badge bg-dark text-muted border border-secondary border-opacity-25 px-2 py-1" style={{ fontSize: 8 }}>ALL SUB-OPERATIONS</span>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase tracking-widest">
                    <th className="ps-4 py-3 fw-medium border-0" style={{ fontSize: 10 }}>Task Spec</th>
                    <th className="py-3 fw-medium border-0" style={{ fontSize: 10 }}>Priority Index</th>
                    <th className="py-3 fw-medium border-0" style={{ fontSize: 10 }}>Status Log</th>
                    <th className="py-3 fw-medium border-0" style={{ fontSize: 10 }}>Personnel</th>
                    <th className="py-3 fw-medium border-0" style={{ fontSize: 10 }}>Deadline</th>
                    <th className="pe-4 py-3 fw-medium border-0 text-end" style={{ fontSize: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="border-0">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted fst-italic">No sub-tasks detected in this sequence.</td>
                    </tr>
                  ) : (
                    tasks.map(t => (
                      <tr key={t.taskId} className="border-secondary border-opacity-10">
                        <td className="ps-4 py-4">
                          <div className="fw-bold text-white mb-1">{t.title}</div>
                          <div className="text-muted small line-clamp-1" style={{ maxWidth: 250, fontSize: 11 }}>{t.description || "No description provided."}</div>
                        </td>
                        <td>{getPriorityBadge(t.priority)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase tracking-wider" style={{ fontSize: 9 }}>
                            {getStatusIcon(t.status)}
                            {t.status === 1 ? 'Pending' : t.status === 2 ? 'In Progress' : t.status === 3 ? 'Completed' : 'Overdue'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                             <div className="avatar-small rounded-circle bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25 d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 32, height: 32, fontSize: 12 }}>
                                {t.assignee?.fullName?.charAt(0) || <User size={14} />}
                             </div>
                             <span className="small text-white fw-medium">{t.assignee?.fullName || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="text-muted small" style={{ fontSize: 11 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="pe-4 text-end">
                           <button className="btn btn-link text-muted p-2 hover-white"><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-panel border-primary border-opacity-25 shadow-2xl animate-in zoom-in duration-300">
              <div className="modal-header border-secondary border-opacity-10 p-4">
                <h5 className="modal-title fw-black text-white tracking-tighter">INITIATE SUB-TASK.</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Task Designation</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary border-opacity-25 py-2 px-3" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Title of the operation..." />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Operational Parameters</label>
                    <textarea className="form-control bg-dark text-white border-secondary border-opacity-25 py-2 px-3" rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Detailed description of sub-task metrics..."></textarea>
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Priority Index</label>
                      <select className="form-select bg-dark text-white border-secondary border-opacity-25" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: parseInt(e.target.value)})}>
                        <option value={1}>Low Priority</option>
                        <option value={2}>Medium Priority</option>
                        <option value={3}>High Priority</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Deadline</label>
                      <input type="date" className="form-control bg-dark text-white border-secondary border-opacity-25" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label text-muted small fw-bold text-uppercase tracking-widest">Personnel Assignment</label>
                    <select className="form-select bg-dark text-white border-secondary border-opacity-25 py-2 px-3" required value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                      <option value="">Select individual member...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-10 p-4">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2 border-opacity-25" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2">
                    <Send size={16} /> Deploy Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
