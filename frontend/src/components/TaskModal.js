"use client";

import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

import API from '@/config/api';

export default function TaskModal({ isOpen, onClose, task, onSave }) {
  const [formData, setFormData] = useState({ 
    taskId: '', title: '', description: '', priority: 2, status: 1, assigneeId: '', dueDate: '' 
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Checklist / Sub-tasks state
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    fetch(`${API}/auth/users`).then(r => r.json()).then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({ 
        taskId: task.id || '', 
        title: task.title || '', 
        description: task.description || '', 
        priority: task.priority === 'High' ? 3 : (task.priority === 'Low' ? 1 : 2), 
        status: task.status === 'In Progress' ? 2 : (task.status === 'Completed' ? 3 : (task.status === 'Overdue' ? 4 : 1)), 
        assigneeId: task.assigneeId || '',
        dueDate: task.due && task.due !== 'TBD' ? new Date(task.due).toISOString().split('T')[0] : ''
      });
      fetchSubtasks(task.id);
    } else {
      setFormData({ taskId: '', title: '', description: '', priority: 2, status: 1, assigneeId: '', dueDate: '' });
      setSubtasks([]);
    }
    setError(null);
  }, [task, isOpen]);

  const fetchSubtasks = async (id) => {
    try {
      const res = await fetch(`${API}/tasks/${id}/subtasks`);
      if (res.ok) setSubtasks(await res.json());
    } catch (e) { console.error(e); }
  };

  const addSubtask = async () => {
    if (!newSubtask || !formData.taskId) return;
    try {
      const res = await fetch(`${API}/tasks/${formData.taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtask })
      });
      if (res.ok) {
        setNewSubtask("");
        fetchSubtasks(formData.taskId);
      }
    } catch (e) { console.error(e); }
  };

  const toggleSubtask = async (id) => {
    try {
      await fetch(`${API}/tasks/subtasks/${id}/toggle`, { method: 'PATCH' });
      fetchSubtasks(formData.taskId);
    } catch (e) { console.error(e); }
  };

  const deleteSubtask = async (id) => {
    try {
      await fetch(`${API}/tasks/subtasks/${id}`, { method: 'DELETE' });
      fetchSubtasks(formData.taskId);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return setError("Task headline is required.");
    setError(null);
    setIsSubmitting(true);
    
    const isEdit = !!formData.taskId;
    const url = isEdit ? `${API}/tasks/${formData.taskId}` : `${API}/tasks`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = { 
       ...formData,
       taskId: isEdit ? formData.taskId : undefined // Guid for POST should be omit or null
    };
    if (!payload.assigneeId) payload.assigneeId = null;
    if (!payload.dueDate) payload.dueDate = null;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
         const data = await res.json().catch(() => ({}));
         setError(data.message || "Engine protocol failure. Validate parameters.");
      }
    } catch (err) { 
       setError("Communication breakdown. Network unavailable.");
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") onClose();
  };

  return (
    <div 
      id="modal-backdrop"
      className="modal show d-block animate-in fade-in duration-300" 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', 
        zIndex: 5000, overflowY: 'auto' 
      }} 
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ pointerEvents: 'none' }}>
        <div className="glass-panel w-100 p-0 overflow-hidden border border-secondary border-opacity-25 shadow-2xl animate-in zoom-in duration-300" 
             style={{ background: '#111827', borderRadius: '24px', pointerEvents: 'auto' }}>
          
          <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-black text-white display-6">{formData.taskId ? 'Edit Task' : 'Create New Task'}</h5>
            <button 
              type="button" 
              className="btn btn-dark p-2 rounded-circle border-secondary border-opacity-25 shadow-sm hover-scale" 
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X size={20} className="text-warning" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 pt-5">
            {error && (
               <div className="alert bg-danger bg-opacity-20 border-danger border-opacity-25 text-white small font-bold mb-4 p-3 rounded-4">
                  <div className="d-flex align-items-center gap-2">
                     <AlertTriangle size={16} />
                     <span>{error}</span>
                  </div>
               </div>
            )}
            <div className="row g-4">
               <div className="col-12">
                  <label className="small text-uppercase tracking-widest font-black text-warning mb-2 px-1" style={{ fontSize: 10 }}>Task Title</label>
                  <input type="text" placeholder="Enter task name" className="form-control bg-dark text-white p-3 rounded-4 border-secondary border-opacity-25" style={{ fontSize: 14, background: '#0a0a0a' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
               </div>

               <div className="col-12">
                  <label className="small text-uppercase tracking-widest font-black text-warning mb-2 px-1" style={{ fontSize: 10 }}>Description</label>
                  <textarea rows="3" placeholder="Enter task details..." className="form-control bg-dark text-white p-3 rounded-4 border-secondary border-opacity-25" style={{ fontSize: 14, background: '#0a0a0a' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
               </div>

               <div className="col-12">
                  <label className="small text-uppercase tracking-widest font-black text-warning mb-2 px-1" style={{ fontSize: 10 }}>Due Date</label>
                  <input 
                    type="date" 
                    className="form-control bg-dark text-white p-3 rounded-4 border-secondary border-opacity-25" 
                    style={{ fontSize: 14, background: '#0a0a0a' }} 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                  />
               </div>

               {/* Checklist Section */}
               {formData.taskId && (
                  <div className="col-12 mt-4">
                     <label className="small text-uppercase tracking-widest font-black text-warning mb-3 px-1" style={{ fontSize: 10 }}>Sub-Tasks</label>
                     <div className="bg-dark bg-opacity-50 p-4 rounded-4 border border-secondary border-opacity-10">
                        {subtasks.length > 0 ? (
                           <div className="d-flex flex-column gap-3 mb-4">
                              {subtasks.map(s => (
                                 <div key={s.subTaskId} className="d-flex align-items-center justify-content-between group">
                                    <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => toggleSubtask(s.subTaskId)}>
                                       {s.isCompleted ? <CheckCircle size={18} className="text-success" /> : <Circle size={18} className="text-muted" />}
                                       <span className={`${s.isCompleted ? 'text-muted text-decoration-line-through' : 'text-white'} fw-bold`} style={{ fontSize: 13 }}>{s.title}</span>
                                    </div>
                                    <button type="button" className="btn btn-link text-danger p-0 border-0 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteSubtask(s.subTaskId)}><Trash2 size={14} /></button>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="small text-muted mb-4 fst-italic">No sub-tasks yet.</p>
                        )}
                        <div className="d-flex gap-2">
                           <input type="text" placeholder="Add new sub-task..." className="form-control bg-dark border-secondary border-opacity-10 text-white px-3 py-2 rounded-3" style={{ fontSize: 12 }} value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())} />
                           <button type="button" className="btn btn-dark px-3 rounded-3" onClick={addSubtask}><Plus size={16} /></button>
                        </div>
                     </div>
                  </div>
               )}

               <div className="col-md-6 mt-5">
                  <label className="small text-uppercase tracking-widest font-black text-warning mb-2 px-1" style={{ fontSize: 10 }}>Assigned To</label>
                  <select className="form-select bg-dark text-white p-3 rounded-4 cursor-pointer border-secondary border-opacity-25" style={{ fontSize: 14, background: '#0a0a0a' }} value={formData.assigneeId || ''} onChange={e => setFormData({...formData, assigneeId: e.target.value})}>
                     <option value="" style={{ color: '#000' }}>Unassigned</option>
                     {users.map(u => <option key={u.id} value={u.id} style={{ color: '#000' }}>{u.fullName}</option>)}
                  </select>
               </div>

               <div className="col-md-6 mt-5">
                  <label className="small text-uppercase tracking-widest font-black text-warning mb-2 px-1" style={{ fontSize: 10 }}>Priority Level</label>
                  <select className="form-select bg-dark text-white p-3 rounded-4 cursor-pointer border-secondary border-opacity-25" style={{ fontSize: 14, background: '#0a0a0a' }} value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                     <option value={1} style={{ color: '#000' }}>Low</option>
                     <option value={2} style={{ color: '#000' }}>Medium</option>
                     <option value={3} style={{ color: '#000' }}>High</option>
                  </select>
               </div>
            </div>

            <div className="mt-5 pt-4 d-flex justify-content-end gap-3 border-top border-secondary border-opacity-10">
               <button type="button" className="btn btn-dark px-4 py-2 rounded-4 fw-bold text-secondary border-secondary border-opacity-10 hover-bg-danger transition-all" onClick={onClose}>Cancel</button>
               <button type="submit" className="btn btn-primary px-5 py-2 rounded-4 fw-black uppercase tracking-widest shadow-lg d-flex align-items-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
