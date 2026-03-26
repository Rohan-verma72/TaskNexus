"use client";

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const API = "http://127.0.0.1:5129/api";

export default function AssignTaskModal({ isOpen, onClose, userId, userName, onSave }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTaskId("");
      setError(null);
      setSuccess(false);
      setLoading(true);
      fetch(`${API}/tasks`)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          // Show all non-completed tasks
          setTasks(Array.isArray(data) ? data.filter(t => t.status !== 3) : []);
          setLoading(false);
        })
        .catch(e => {
          setError("Failed to load tasks. Is the backend running?");
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedTaskId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Fetch current task details
      const tRes = await fetch(`${API}/tasks/${selectedTaskId}`);
      if (!tRes.ok) throw new Error(`Failed to fetch task: HTTP ${tRes.status}`);
      const task = await tRes.json();

      // Build a clean DTO matching the backend UpdateTaskDto
      const payload = {
        taskId: task.taskId,
        projectId: task.projectId || 1,
        title: task.title || '',
        description: task.description || '',
        priority: typeof task.priority === 'number' ? task.priority : 2,
        status: typeof task.status === 'number' ? task.status : 1,
        assigneeId: userId,
        dueDate: task.dueDate || null
      };

      const res = await fetch(`${API}/tasks/${selectedTaskId}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 204) {
        setSuccess(true);
        setTimeout(() => {
          onSave();
          onClose();
        }, 900);
      } else {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Server responded with ${res.status}: ${errBody.substring(0, 100)}`);
      }
    } catch (e) {
      console.error("AssignTaskModal error:", e);
      setError(e.message || "Assignment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 7000 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="glass-panel w-100 p-0 overflow-hidden border border-secondary border-opacity-10 shadow-2xl" style={{ background: '#0d1117', borderRadius: '24px' }}>
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary border-opacity-10">
            <div>
              <h6 className="fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 12 }}>Assign Task</h6>
              <p className="text-primary mb-0" style={{ fontSize: 10 }}>→ {userName}</p>
            </div>
            <button onClick={onClose} className="btn btn-dark p-2 rounded-circle border-secondary border-opacity-25"><X size={16} /></button>
          </div>

          <div className="p-4">
            {/* Error */}
            {error && (
              <div className="alert d-flex align-items-center gap-2 p-3 rounded-3 mb-4" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12 }}>
                <AlertTriangle size={14} className="text-danger flex-shrink-0" />
                <span className="text-danger">{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="alert d-flex align-items-center gap-2 p-3 rounded-3 mb-4" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 12 }}>
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                <span className="text-success">Task assigned successfully!</span>
              </div>
            )}

            {/* Task selector */}
            {loading ? (
              <div className="text-center py-4"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : (
              <div className="mb-4">
                <label className="d-block text-uppercase tracking-widest fw-bold text-primary mb-2" style={{ fontSize: 9 }}>Select a Task to Assign</label>
                <select
                  className="form-select p-3 rounded-4"
                  style={{ fontSize: 13, background: '#161b22', color: '#fff', border: '1px solid rgba(51,65,85,0.5)' }}
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  disabled={isSubmitting || success}
                >
                  <option value="">-- Choose a task --</option>
                  {tasks.map(t => (
                    <option key={t.taskId} value={t.taskId} style={{ background: '#161b22', color: '#fff' }}>
                      {t.title}  [{t.status === 1 ? 'Pending' : t.status === 2 ? 'In Progress' : 'Other'}]
                    </option>
                  ))}
                </select>
                {tasks.length === 0 && !loading && (
                  <p className="text-muted small mt-2 mb-0" style={{ fontSize: 11 }}>No open tasks available.</p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button onClick={onClose} className="btn btn-dark border-secondary border-opacity-25 px-4 py-2 rounded-3 flex-shrink-0" style={{ fontSize: 12 }}>Cancel</button>
              <button
                onClick={handleAssign}
                className="btn btn-primary flex-grow-1 py-2 rounded-3 fw-black uppercase tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={isSubmitting || !selectedTaskId || success}
                style={{ fontSize: 11 }}
              >
                {isSubmitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Assigning...</>
                ) : success ? (
                  <><CheckCircle2 size={14} /> Assigned!</>
                ) : (
                  'Confirm Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
