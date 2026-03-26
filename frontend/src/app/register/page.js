"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Loader2, User, Users } from 'lucide-react';

const API = "http://127.0.0.1:5129/api";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'Developer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/login');
      } else {
        setError('Engine refused registration. Check connectivity.');
      }
    } catch (e) {
      setError('Auth gateway initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
       <div className="container">
          <div className="row justify-content-center">
             <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                <div className="p-5 glass-panel border-primary border-opacity-10 shadow-2xl animate-in zoom-in duration-500 overflow-hidden relative">
                   {/* Background Glow */}
                   <div className="position-absolute top-0 end-0 bg-info bg-opacity-25 rounded-circle blur-3xl translate-middle" style={{ width: 150, height: 150 }}></div>

                   <div className="text-center mb-5 position-relative">
                      <div className="btn btn-primary p-3 rounded-4 mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                         <UserPlus size={32} />
                      </div>
                      <h2 className="fw-black text-white display-6 mb-2">Register</h2>
                      <p className="text-secondary small font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>Create your account to get started.</p>
                   </div>

                   {error && <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger px-4 py-3 rounded-4 mb-4 fw-bold small text-center">{error}</div>}

                   <form onSubmit={handleRegister}>
                      <div className="mb-4">
                         <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Full Name</label>
                         <div className="position-relative">
                            <User size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <input type="text" placeholder="Full legal name" className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4" style={{ fontSize: 13 }} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                         </div>
                      </div>

                      <div className="mb-4">
                         <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Operational Email</label>
                         <div className="position-relative">
                            <Mail size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <input type="email" placeholder="name@company.com" className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4" style={{ fontSize: 13 }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                         </div>
                      </div>

                      <div className="mb-4">
                         <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Secure Password</label>
                         <div className="position-relative">
                            <Lock size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <input type="password" placeholder="••••••••••••" className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4" style={{ fontSize: 13 }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                         </div>
                      </div>

                      <div className="mb-5">
                         <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Operational Role</label>
                         <div className="position-relative">
                            <Users size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <select className="form-select bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4 cursor-pointer" style={{ fontSize: 13 }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                               <option value="Admin">Admin</option>
                               <option value="Manager">Manager</option>
                               <option value="Developer">Developer</option>
                            </select>
                         </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100 py-3 rounded-4 fs-6 fw-black uppercase tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2 mb-4" disabled={loading}>
                         {loading ? <Loader2 size={18} className="animate-spin" /> : <>Register Account</>}
                      </button>

                      <div className="text-center">
                         <p className="text-secondary small font-bold mb-0">Already have an account? <Link href="/login" className="text-primary text-decoration-none fw-black tracking-widest uppercase ps-2" style={{ fontSize: 9 }}>Login</Link></p>
                      </div>
                   </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
