"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, CircleAlert, CheckCircle2, 
  Clock, Plus, Filter, Search, RefreshCw, Target 
} from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import TimeLogModal from '@/components/TimeLogModal';

const API = "http://127.0.0.1:5129/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [logTaskId, setLogTaskId] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks`);
      if (res.ok) {
        const data = await res.json();
        const statusMap = { 1: 'Pending', 2: 'In Progress', 3: 'Completed', 4: 'Overdue' };
        const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
        
        const mapped = await Promise.all(data.map(async t => {
           // Fetch subtasks count
           let completed = 0;
           let total = 0;
           try {
              const sr = await fetch(`${API}/tasks/${t.taskId}/subtasks`);
              if (sr.ok) {
                 const subs = await sr.json();
                 total = subs.length;
                 completed = subs.filter(s => s.isCompleted).length;
              }
           } catch (e) {}

           return {
              id: String(t.taskId),
              title: t.title,
              description: t.description,
              status: statusMap[t.status] || 'Pending',
              priority: priorityMap[t.priority] || 'Medium',
              assigneeId: t.assigneeId,
              due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD',
              subtasks: { completed, total },
              totalHours: t.totalHours || 0
           };
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openCreateModal = () => { setEditingTask(null); setModalOpen(true); };
  const openEditModal = (id) => { setEditingTask(tasks.find(t => t.id === id)); setModalOpen(true); };
  const openLogModal = (id) => { setLogTaskId(id); setLogModalOpen(true); };
  
  const deleteTask = async (id) => {
     if (!confirm('Abort task sequence?')) return;
     await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
     fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(t => {
     const matchQ = t.title.toLowerCase().includes(search.toLowerCase());
     const matchP = !filterPriority || t.priority === filterPriority;
     const matchS = !filterStatus || t.status === filterStatus;
     
     let matchD = true;
     if (filterDate === "Today") {
        const today = new Date().toLocaleDateString();
        matchD = t.due === today;
     } else if (filterDate === "Overdue") {
        matchD = t.status === "Overdue";
     }

     return matchQ && matchP && matchS && matchD;
  });

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'text-primary', icon: <Clock size={24} /> },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'text-info', icon: <TrendingUp size={24} /> },
    { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: 'text-success', icon: <CheckCircle2 size={24} /> },
    { label: 'Overdue', value: tasks.filter(t => t.status === 'Overdue').length, color: 'text-danger', icon: <CircleAlert size={24} /> },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-h-100 py-5 translate-y-20">
         <div className="spinner-border text-primary border-4" style={{ width: 64, height: 64 }} role="status"></div>
         <span className="mt-4 fw-bold uppercase tracking-widest text-muted" style={{ fontSize: 10 }}>Syncing Engine...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
       {/* Page Header */}
       <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
          <div>
             <h1 className="display-6 fw-black text-white mb-2">Dashboard</h1>
             <p className="text-light-muted mb-0 opacity-75">Check live updates and project health.</p>
          </div>
          <div className="d-flex gap-3">
             <div className="stat-card glass-panel p-2 px-4 border-0 d-flex align-items-center gap-3 shadow-lg">
                <Target size={20} className="text-primary" />
                <div>
                   <h6 className="fw-black text-white mb-0" style={{ fontSize: 13 }}>{completedTasks} / {totalTasks}</h6>
                   <p className="small text-uppercase tracking-widest text-muted mb-0" style={{ fontSize: 8 }}>Tasks Done</p>
                </div>
             </div>
             <button className="btn btn-primary d-flex align-items-center gap-2 px-4" onClick={() => { setEditingTask(null); setModalOpen(true); }}>
                <Plus size={18} /> <span>Create New</span>
             </button>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="row g-4 mb-5">
          {stats.map(s => (
             <div key={s.label} className="col-12 col-md-6 col-xl-3">
                <div className="stat-card glass-panel h-100 d-flex flex-column gap-3">
                   <div className="d-flex align-items-center justify-content-between">
                      <div className={`p-3 rounded-4 bg-dark bg-opacity-25 ${s.color}`}>{s.icon}</div>
                      <span className="badge bg-dark rounded-pill border border-secondary border-opacity-10 px-2 text-muted" style={{ fontSize: 9 }}>REALTIME</span>
                   </div>
                   <div>
                      <h4 className="fw-black text-white mb-0 display-6">{s.value}</h4>
                      <p className="small text-uppercase tracking-widest font-bold text-muted mb-0 mt-1" style={{ fontSize: 10 }}>{s.label}</p>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Toolbar */}
       <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mb-5 p-4 glass-panel border-secondary border-opacity-10 shadow-xl">
          <div className="position-relative flex-grow-1" style={{ maxWidth: 400 }}>
             <Search size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
             <input 
                type="text" 
                placeholder="Search tasks..." 
                className="form-control bg-dark border-secondary border-opacity-10 text-white ps-5 py-3 rounded-4" 
                style={{ fontSize: 14 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
          <div className="d-flex flex-wrap gap-2">
             <select 
                className="form-select bg-dark bg-opacity-25 border-secondary border-opacity-25 text-white px-4 rounded-4 cursor-pointer" 
                style={{ fontSize: 13, width: 180 }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
             >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
             </select>

             <select 
                className="form-select bg-dark bg-opacity-25 border-secondary border-opacity-25 text-white px-4 rounded-4 cursor-pointer" 
                style={{ fontSize: 13, width: 140 }}
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
             >
                <option value="">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
             </select>

             <select 
                className="form-select bg-dark bg-opacity-25 border-secondary border-opacity-25 text-white px-4 rounded-4 cursor-pointer" 
                style={{ fontSize: 13, width: 140 }}
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
             >
                <option value="">By Date</option>
                <option value="Today">Due Today</option>
                <option value="Overdue">Overdue</option>
             </select>

             <button className="btn btn-dark p-3 glass-panel border-0 text-secondary"><Filter size={18} /></button>
          </div>
       </div>

       {/* Kanban Board */}
       <KanbanBoard 
          tasks={filteredTasks} 
          setTasks={setTasks}
          onEdit={openEditModal}
          onDelete={deleteTask}
          onLogTime={openLogModal}
       />

       <TaskModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          task={editingTask}
          onSave={fetchTasks}
       />

       <TimeLogModal 
          isOpen={logModalOpen} 
          onClose={() => setLogModalOpen(false)} 
          taskId={logTaskId}
          onSave={() => { fetchTasks(); window.dispatchEvent(new CustomEvent('time-logged')); }}
       />
    </div>
  );
}
