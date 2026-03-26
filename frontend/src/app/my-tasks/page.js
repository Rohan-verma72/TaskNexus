"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Circle, Clock, AlertTriangle,
  RefreshCw, Loader2, ListTodo, Flame, TrendingUp, CheckSquare, Search
} from "lucide-react";
import TimeLogModal from '@/components/TimeLogModal';

const API = "http://127.0.0.1:5129/api";

const STATUS_MAP = {
  1: { label: "Pending",     color: "text-warning bg-warning bg-opacity-10 border-warning border-opacity-25",    icon: Clock },
  2: { label: "In Progress", color: "text-primary bg-primary bg-opacity-10 border-primary border-opacity-25",       icon: TrendingUp },
  3: { label: "Completed",   color: "text-success bg-success bg-opacity-10 border-success border-opacity-25", icon: CheckCircle2 },
  4: { label: "Overdue",     color: "text-danger bg-danger bg-opacity-10 border-danger border-opacity-25",       icon: AlertTriangle },
};

const PRI_MAP = {
  1: { label: "Low",      color: "text-secondary bg-secondary bg-opacity-10 border-secondary border-opacity-25" },
  2: { label: "Medium",   color: "text-warning bg-warning bg-opacity-10 border-warning border-opacity-25" },
  3: { label: "High",     color: "text-danger bg-danger bg-opacity-10 border-danger border-opacity-25" },
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [logTaskId, setLogTaskId] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks`);
      if (res.ok) {
        const data = await res.json();
        const userId = localStorage.getItem("userId");
        setTasks(userId ? data.filter(t => t.assigneeId === userId) : data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const markStatus = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await fetch(`${API}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const openLogModal = (id) => { setLogTaskId(id); setLogModalOpen(true); };

  const filtered = tasks.filter(t => {
    const priOk = priorityFilter === 0 || t.priority === priorityFilter;
    const searchOk = !search || 
      t.title.toLowerCase().includes(search.toLowerCase());
    return priOk && searchOk;
  });

  if (loading) {
    return (
       <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="mt-3 text-muted">Syncing personal workspace...</p>
       </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">My Flow.</h1>
             <p className="text-secondary mb-0">Total workload optimized for performance.</p>
          </div>
          <button onClick={fetchTasks} className="btn btn-primary d-flex align-items-center gap-2">
             <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh tasks
          </button>
       </div>

       <div className="d-flex flex-column flex-md-row gap-3 mb-5">
          <div className="position-relative flex-grow-1">
             <Search size={16} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
             <input type="text" placeholder="Filter my tasks..." className="form-control bg-dark bg-opacity-25 border-secondary border-opacity-10 text-white ps-5 py-3 rounded-4" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select bg-dark bg-opacity-25 border-secondary border-opacity-10 text-white px-4 rounded-4" style={{ width: 200 }} value={priorityFilter} onChange={e => setPriorityFilter(Number(e.target.value))}>
             <option value={0}>All Priorities</option>
             <option value={1}>Low Priority</option>
             <option value={2}>Medium Priority</option>
             <option value={3}>High Priority</option>
          </select>
       </div>

       <div className="row g-3">
          {filtered.length > 0 ? filtered.map(t => {
             const st = STATUS_MAP[t.status] || STATUS_MAP[1];
             const pr = PRI_MAP[t.priority] || PRI_MAP[1];
             const Icon = st.icon;
             const isUpdating = updatingId === t.taskId;

             return (
                <div key={t.taskId} className="col-12">
                   <div className="glass-panel p-4 d-flex flex-column flex-md-row align-items-md-center gap-4 transition-all hover-scale cursor-default">
                      <div className="btn btn-dark p-2 rounded-4 border-secondary border-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }} onClick={() => markStatus(t.taskId, t.status === 3 ? 1 : 3)}>
                         {isUpdating ? <Loader2 size={24} className="animate-spin text-primary" /> : <Icon size={24} className={st.color.split(' ')[0]} />}
                      </div>
                      
                      <div className="flex-grow-1">
                         <h5 className="fw-bold text-white mb-1">{t.title}</h5>
                         <p className="text-muted small mb-0 truncate-2">{t.description || "Detailed analysis required."}</p>
                          <div className="d-flex gap-2 mt-3">
                             <span className={`badge ${st.color} border px-2`} style={{ fontSize: 9 }}>{st.label}</span>
                             <span className={`badge ${pr.color} border px-2`} style={{ fontSize: 9 }}>{pr.label}</span>
                             {t.totalHours > 0 && <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-2" style={{ fontSize: 9 }}>Logged: {t.totalHours}h</span>}
                          </div>
                      </div>

                       <div className="d-flex gap-2">
                          <button className="btn btn-outline-info btn-sm px-3 rounded-pill fw-bold" onClick={() => markStatus(t.taskId, 2)} style={{ fontSize: 10 }}>Start</button>
                          <button className="btn btn-outline-success btn-sm px-3 rounded-pill fw-bold" onClick={() => markStatus(t.taskId, 3)} style={{ fontSize: 10 }}>Complete</button>
                          <button className="btn btn-dark btn-sm rounded-circle p-2 border-secondary border-opacity-25" onClick={() => openLogModal(t.taskId)}><Clock size={14} className="text-primary" /></button>
                       </div>
                   </div>
                </div>
             );
          }) : (
             <div className="col-12 text-center py-5 opacity-50">
                <CheckSquare size={48} className="mb-3 text-primary" />
                <h5 className="text-white">Zero backlog detected.</h5>
                <p className="text-secondary small">Your personal workspace is currently optimized for other activities.</p>
             </div>
          )}
       </div>
    </div>
  );
}
