"use client";

import { useState, useEffect, useCallback } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Settings, Search, 
  LogOut, Target, TrendingUp, Users, Menu, X, BookOpen, Bell, AlertTriangle, User 
} from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState(null);
  const [userInitials, setUserInitials] = useState("GU");
  const [userRole, setUserRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const fetchNotifications = useCallback(() => {
    const uid = localStorage.getItem("userId");
    if (uid) {
      fetch(`http://127.0.0.1:5129/api/auth/notifications/${uid}`)
        .then(async r => {
           if (r.ok) {
              const data = await r.json();
              setNotifications(Array.isArray(data) ? data : []);
           }
        })
        .catch(e => console.warn("Notifications sync failed."));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const name = localStorage.getItem("userName");
      if (name) {
        setUserName(name);
        const parts = name.split(" ");
        const initials = parts.map(p => p[0]).join("").toUpperCase().substring(0, 2);
        setUserInitials(initials || "U");
      }
      setUserRole(localStorage.getItem("userRole"));

      fetchNotifications();
      
      // Live Polling every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      
      // Listen for local events that should trigger status refreshes
      window.addEventListener('task-updated', fetchNotifications);
      window.addEventListener('time-logged', fetchNotifications);

      return () => {
         clearInterval(interval);
         window.removeEventListener('task-updated', fetchNotifications);
         window.removeEventListener('time-logged', fetchNotifications);
      };
    }
  }, [mounted, pathname, fetchNotifications]);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    router.push("/login");
  };

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    );
  }

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { label: 'My Tasks', icon: <CheckSquare size={20} />, href: '/my-tasks' },
    { label: 'Projects', icon: <FolderKanban size={20} />, href: '/projects' },
    { label: 'Reports', icon: <TrendingUp size={20} />, href: '/reports' },
    ...(mounted && userRole !== 'Developer' ? [{ label: 'Team', icon: <Users size={20} />, href: '/team' }] : []),
    { label: 'Guide', icon: <BookOpen size={20} />, href: '/docs' },
    { label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Background Visuals */}
        <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1, pointerEvents: 'none', background: '#030014' }}>
           <div className="position-absolute top-0 start-0 bg-primary bg-opacity-20 rounded-circle blur-3xl opacity-30" style={{ width: '60vw', height: '60vw', transform: 'translate(-30%, -30%)', filter: 'blur(120px)' }}></div>
           <div className="position-absolute bottom-0 end-0 bg-info bg-opacity-10 rounded-circle blur-3xl opacity-20" style={{ width: '50vw', height: '50vw', transform: 'translate(30%, 30%)', filter: 'blur(100px)' }}></div>
        </div>

        <div className="d-flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className={`sidebar shrink-0 h-100 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'd-none d-md-flex'}`} 
                 style={{ 
                   position: sidebarOpen ? 'fixed' : 'relative', 
                   zIndex: 1000,
                   transform: (mounted && typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarOpen) ? 'translateX(-100%)' : 'none'
                 }}>
            <Link href="/" className="px-5 py-5 d-flex align-items-center gap-3 text-decoration-none">
               <div className="btn btn-primary d-flex align-items-center justify-content-center p-0" style={{ width: 40, height: 40, fontSize: 20 }}>T</div>
               <span className="fs-4 fw-black tracking-tight text-white mb-0">TaskNexus</span>
            </Link>

            <nav className="flex-grow-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={`nav-item-custom ${pathname === item.href ? 'active text-primary' : 'text-slate-400'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-top border-secondary border-opacity-10 m-3">
               {userName ? (
                  <button className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center gap-3 border-0 py-2" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
               ) : (
                  <Link href="/login" className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                    <LogOut size={16} className="rotate-180" /> Login
                  </Link>
               )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow-1 d-flex flex-column h-screen overflow-hidden">
            {/* Header */}
            <header className="px-4 px-md-5 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-10 bg-app-bg bg-opacity-50 blur-md" style={{ height: '80px' }}>
              <div className="d-flex align-items-center gap-3 w-100 max-w-lg">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="d-md-none btn btn-link text-white p-2 glass-panel border-0">
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="position-relative w-100">
                  <Search size={18} className="position-absolute translate-middle-y top-50 start-0 ms-3 text-slate-500" />
                  <input type="text" placeholder="Search across all tasks..." className="form-control bg-dark bg-opacity-25 border-secondary border-opacity-25 text-white ps-5 py-2 rounded-pill" style={{ fontSize: 13 }} />
                </div>
              </div>

              <div className="d-flex align-items-center gap-4 ms-4">
                  <div className="position-relative">
                     <button className="btn btn-link text-white p-2 position-relative" onClick={() => setNotifOpen(!notifOpen)}>
                       <Bell size={20} />
                       {notifications.filter(n => !n.isRead).length > 0 && (
                         <span className="position-absolute top-0 start-100 translate-middle-x badge rounded-pill bg-danger" style={{ fontSize: 8 }}>
                           {notifications.filter(n => !n.isRead).length}
                         </span>
                       )}
                     </button>
                     
                     {notifOpen && (
                        <div className="position-absolute end-0 mt-3 glass-panel border-secondary border-opacity-10 shadow-2xl p-0 overflow-hidden animate-in slide-in-from-top-2 duration-300" style={{ width: 320, zIndex: 6000 }}>
                           <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                              <h6 className="mb-0 fw-black text-white text-uppercase tracking-widest" style={{ fontSize: 10 }}>Notifications</h6>
                              <span className="badge bg-dark rounded-pill border border-secondary border-opacity-10 px-2 text-muted" style={{ fontSize: 8 }}>ALERTS</span>
                           </div>
                           <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
                              {notifications.length > 0 ? (
                                notifications.map(n => (
                                   <div key={n.notificationId} className={`p-4 border-bottom border-secondary border-opacity-5 ${n.isRead ? 'opacity-50' : 'bg-primary bg-opacity-5'}`}>
                                      <div className="d-flex align-items-start gap-3">
                                         <div className={`p-2 rounded-circle ${n.message.includes('overdue') ? 'bg-danger' : 'bg-primary'} bg-opacity-25`}>
                                            <AlertTriangle size={14} className={n.message.includes('overdue') ? 'text-danger' : 'text-primary'} />
                                         </div>
                                         <div>
                                            <p className="small text-white mb-1" style={{ fontSize: 11, lineHeight: '1.4' }}>{n.message}</p>
                                            <span className="text-muted" style={{ fontSize: 9 }}>{new Date(n.createdAt).toLocaleString()}</span>
                                         </div>
                                      </div>
                                   </div>
                                ))
                              ) : (
                                 <div className="p-5 text-center opacity-25">
                                    <Bell size={32} className="mb-2" />
                                    <p className="small mb-0">No active alerts detected.</p>
                                 </div>
                              )}
                           </div>
                           <div className="p-3 bg-dark bg-opacity-50 text-center">
                              <a href="#" className="small text-primary text-decoration-none fw-black" style={{ fontSize: 9 }}>CLEAR ALL AUDIT LOGS</a>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="position-relative">
                     <div 
                        className="avatar px-1 py-1 rounded-pill bg-gradient-to-tr from-primary to-info hover-scale cursor-pointer" 
                        style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, cursor: 'pointer' }}
                        onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                     >
                        {userInitials}
                     </div>

                     {profileOpen && (
                        <div className="position-absolute end-0 mt-3 glass-panel border-secondary border-opacity-10 shadow-2xl p-0 overflow-hidden animate-in slide-in-from-top-2 duration-300" style={{ width: 200, zIndex: 6000 }}>
                           <div className="p-3 border-bottom border-secondary border-opacity-10 bg-dark bg-opacity-50">
                              <p className="small text-white fw-black mb-0 truncate-1">{userName}</p>
                              <p className="text-secondary mb-0" style={{ fontSize: 9 }}>{userRole}</p>
                           </div>
                           <div className="p-2">
                              <Link href="/profile" className="nav-item-custom m-0 border-0 py-2 w-100 fs-xs" style={{ fontSize: 11 }} onClick={() => setProfileOpen(false)}>
                                 <User size={14} /> My Identity
                              </Link>
                              <Link href="/settings" className="nav-item-custom m-0 border-0 py-2 w-100" style={{ fontSize: 11 }} onClick={() => setProfileOpen(false)}>
                                 <Settings size={14} /> Settings
                              </Link>
                              <div className="border-top border-secondary border-opacity-5 my-1"></div>
                              <button className="nav-item-custom m-0 border-0 py-2 w-100 text-danger bg-transparent" style={{ fontSize: 11 }} onClick={handleLogout}>
                                 <LogOut size={14} /> Logout Session
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-grow-1 overflow-y-auto p-4 p-md-5">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
