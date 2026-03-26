"use client";

import { useState } from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';

import API from '@/config/api';

export default function TimeLogModal({ isOpen, onClose, taskId, onSave }) {
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hours || isNaN(hours) || hours <= 0) return setError("Please enter valid positive number of hours.");
    setError(null);
    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
       setError("Identity context lost. Please log in again.");
       setIsSubmitting(false);
       return;
    }

    try {
      const res = await fetch(`${API}/timelogs`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           taskId, 
           userId, 
           hours: parseFloat(hours), 
           note: note || "Work completed." 
        })
      });

      if (res.ok) {
        setHours("");
        setNote("");
        onSave();
        onClose();
      } else {
        setError("Storage engine rejection. Validate input metrics.");
      }
    } catch (err) {
      setError("Network frequency disruption. Retry sync.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === "log-backdrop") onClose();
  };

  return (
    <div 
      id="log-backdrop"
      className="modal show d-block animate-in fade-in duration-300" 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
        zIndex: 6000, overflowY: 'auto' 
      }} 
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px', pointerEvents: 'none' }}>
        <div className="glass-panel w-100 p-0 overflow-hidden border border-secondary border-opacity-25 shadow-2xl animate-in slide-in-from-bottom-4 duration-300" 
             style={{ background: '#111827', borderRadius: '24px', pointerEvents: 'auto' }}>
          
          <div className="modal-header border-0 p-4 pb-2 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
               <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                  <Clock size={20} />
               </div>
               <h5 className="modal-title fw-black text-white mb-0 uppercase tracking-widest" style={{ fontSize: 13 }}>Capture Effort</h5>
            </div>
            <button 
              type="button" 
              className="btn btn-dark p-2 rounded-circle border-secondary border-opacity-25 shadow-sm hover-scale" 
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X size={16} className="text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 pt-4">
            {error && (
               <div className="alert bg-danger bg-opacity-20 border-danger border-opacity-25 text-white small font-bold mb-4 p-3 rounded-4">
                  <div className="d-flex align-items-center gap-2">
                     <AlertTriangle size={14} />
                     <span style={{ fontSize: 11 }}>{error}</span>
                  </div>
               </div>
            )}
            
            <div className="mb-4">
               <label className="small text-uppercase tracking-widest font-black text-primary mb-2 px-1 d-block opacity-75" style={{ fontSize: 9 }}>Hours Consumed</label>
               <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 2.5" 
                  className="form-control bg-dark text-white p-3 rounded-4 border-secondary border-opacity-25 focus-ring shadow-none" 
                  style={{ fontSize: 16, background: '#0a0a0a' }} 
                  value={hours} 
                  onChange={e => setHours(e.target.value)} 
                  required 
                  autoFocus
               />
            </div>

            <div className="mb-4">
               <label className="small text-uppercase tracking-widest font-black text-primary mb-2 px-1 d-block opacity-75" style={{ fontSize: 9 }}>Activity Note</label>
               <textarea 
                  rows="2" 
                  placeholder="Briefly describe optimization status..." 
                  className="form-control bg-dark text-white p-3 rounded-4 border-secondary border-opacity-25" 
                  style={{ fontSize: 13, background: '#0a0a0a' }} 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
               ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-3 rounded-4 fw-black uppercase tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting}>
               {isSubmitting ? "Syncing..." : "Commit Log Entry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
