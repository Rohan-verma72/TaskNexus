"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const API = "http://127.0.0.1:5129/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.fullName);
        router.push('/');
      } else {
        setError('Access denied. Verify credentials.');
      }
    } catch (e) {
      setError('Connection to auth engine failed.');
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
                   <div className="position-absolute top-0 start-50 translate-middle bg-primary bg-opacity-25 rounded-circle blur-3xl" style={{ width: 150, height: 150 }}></div>

                   <div className="text-center mb-5 position-relative">
                      <div className="btn btn-primary p-3 rounded-4 mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                         <LogIn size={32} />
                      </div>
                      <h2 className="fw-black text-white display-6 mb-2">Login</h2>
                      <p className="text-secondary small font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>TaskNexus Platform v4.1</p>
                   </div>

                   {error && <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger px-4 py-3 rounded-4 mb-4 fw-bold small text-center">{error}</div>}

                   <form onSubmit={handleLogin}>
                      <div className="mb-4">
                         <label className="small text-uppercase tracking-widest font-black text-muted mb-2 px-1" style={{ fontSize: 9 }}>Secure Email</label>
                         <div className="position-relative">
                            <Mail size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <input type="email" placeholder="name@company.com" className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4" style={{ fontSize: 13 }} value={email} onChange={e => setEmail(e.target.value)} required />
                         </div>
                      </div>

                      <div className="mb-5">
                         <div className="d-flex justify-content-between mb-2 px-1">
                            <label className="small text-uppercase tracking-widest font-black text-muted" style={{ fontSize: 9 }}>Encrypted Password</label>
                            <a href="#" className="text-primary text-decoration-none small font-black tracking-widest" style={{ fontSize: 9 }}>FORGOT?</a>
                         </div>
                         <div className="position-relative">
                            <Lock size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-secondary" />
                            <input type="password" placeholder="••••••••••••" className="form-control bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white ps-5 py-3 rounded-4" style={{ fontSize: 13 }} value={password} onChange={e => setPassword(e.target.value)} required />
                         </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100 py-3 rounded-4 fs-6 fw-black uppercase tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2 mb-4" disabled={loading}>
                         {loading ? <Loader2 size={18} className="animate-spin" /> : <>Login to System <ArrowRight size={18} /></>}
                      </button>

                      <div className="text-center">
                         <p className="text-secondary small font-bold mb-0">New operative? <Link href="/register" className="text-primary text-decoration-none fw-black tracking-widest uppercase ps-2" style={{ fontSize: 9 }}>Register Account</Link></p>
                      </div>
                   </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
