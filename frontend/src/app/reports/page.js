"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, CheckCircle2, CircleAlert, Clock, BarChart3, PieChart, Activity, ShieldCheck, Database, Loader2, Users } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const API = "http://127.0.0.1:5129/api";

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([fetch(`${API}/tasks`), fetch(`${API}/auth/users`)]);
      if (tRes.ok) setTasks(await tRes.json());
      if (uRes.ok) setUsers(await uRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 1).length;
  const inProgress = tasks.filter(t => t.status === 2).length;
  const completed = tasks.filter(t => t.status === 3).length;
  const overdue = tasks.filter(t => t.status === 4).length;
  const low = tasks.filter(t => t.priority === 1).length;
  const med = tasks.filter(t => t.priority === 2).length;
  const high = tasks.filter(t => t.priority === 3).length;
  const totalHours = tasks.reduce((acc, t) => acc + (t.totalHours || 0), 0);
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  // Per-user task counts
  const userTaskCounts = users.map(u => ({
    name: u.fullName,
    assigned: tasks.filter(t => t.assigneeId === u.id).length,
    completed: tasks.filter(t => t.assigneeId === u.id && t.status === 3).length,
    hours: tasks.filter(t => t.assigneeId === u.id).reduce((a, t) => a + (t.totalHours || 0), 0),
  })).filter(u => u.assigned > 0);

  // Workload per user
  const workload = {};
  tasks.forEach(t => {
    if (t.totalHours > 0) {
      const found = users.find(u => u.id === t.assigneeId);
      const name = found ? found.fullName : 'Unassigned';
      workload[name] = (workload[name] || 0) + t.totalHours;
    }
  });

  const statusData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    datasets: [{
      label: 'Tasks',
      data: [pending, inProgress, completed, overdue],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      borderWidth: 0, borderRadius: 12
    }]
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Priority Matrix',
      data: [low, med, high],
      backgroundColor: ['#64748b', '#3b82f6', '#ef4444'],
      borderWidth: 0, borderRadius: 12
    }]
  };

  const workloadData = {
    labels: Object.keys(workload).length ? Object.keys(workload) : ['No Logs'],
    datasets: [{
      label: 'Hours Logged',
      data: Object.values(workload).length ? Object.values(workload) : [0],
      backgroundColor: ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'],
      borderWidth: 0, borderRadius: 8
    }]
  };

  const priorityCompletionData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Total',
        data: [low, med, high],
        backgroundColor: 'rgba(100,116,139,0.25)',
        borderWidth: 0, borderRadius: 6
      },
      {
        label: 'Completed',
        data: [
          tasks.filter(t => t.priority === 1 && t.status === 3).length,
          tasks.filter(t => t.priority === 2 && t.status === 3).length,
          tasks.filter(t => t.priority === 3 && t.status === 3).length,
        ],
        backgroundColor: ['#64748b', '#3b82f6', '#ef4444'],
        borderWidth: 0, borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 700, size: 10 } } },
      title: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { weight: 700, size: 9 } } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.1)' }, ticks: { color: '#475569', font: { weight: 700, size: 9 } } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 700, size: 10 } } },
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="mt-3 text-muted">Aggregating performance data...</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div>
          <h1 className="display-6 fw-black text-white mb-2">Metrics.</h1>
          <p className="text-secondary mb-0">High-fidelity data visualization for strategic alignment.</p>
        </div>
        <div className="d-flex gap-2">
          <div className="p-3 rounded-4 glass-panel border-0 text-white d-flex align-items-center gap-2 px-4 shadow-lg">
            <Activity size={18} className="text-primary" />
            <span className="fw-900 tracking-widest text-uppercase" style={{ fontSize: 9 }}>Engine Health: Stable</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Completion Rate', value: completionRate+'%', icon: <CheckCircle2 size={24} />, color: 'text-success' },
          { label: 'Risk Factor (Overdue)', value: total ? Math.round((overdue/total)*100)+'%' : '0%', icon: <CircleAlert size={24} />, color: 'text-danger' },
          { label: 'Active Pipeline', value: inProgress + pending, icon: <Activity size={24} />, color: 'text-primary' },
          { label: 'Workforce Effort', value: totalHours + 'h', icon: <Clock size={24} />, color: 'text-warning' },
          { label: 'Total Volume', value: total, icon: <Database size={24} />, color: 'text-info' },
        ].map(s => (
          <div key={s.label} className="col-6 col-xl">
            <div className="stat-card glass-panel p-4 d-flex align-items-center gap-3 transition-all hover-scale cursor-default h-100">
              <div className={`p-3 rounded-4 bg-dark bg-opacity-25 ${s.color}`}>{s.icon}</div>
              <div>
                <h4 className="fw-black text-white mb-0">{s.value}</h4>
                <p className="small text-uppercase tracking-widest font-bold text-muted mb-0" style={{ fontSize: 9 }}>{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Row 1: Status bar + Priority pie */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-8">
          <div className="stat-card glass-panel p-5 h-100 border-primary border-opacity-10 shadow-lg">
            <div className="d-flex align-items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary" />
              <h6 className="fw-black text-white text-uppercase tracking-widest mb-0" style={{ fontSize: 11 }}>Task Distribution Velocity</h6>
            </div>
            <div style={{ height: 300 }}><Bar data={statusData} options={chartOptions} /></div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="stat-card glass-panel p-5 h-100 border-info border-opacity-10 shadow-lg">
            <div className="d-flex align-items-center gap-2 mb-4">
              <PieChart size={20} className="text-info" />
              <h6 className="fw-black text-white text-uppercase tracking-widest mb-0" style={{ fontSize: 11 }}>Priority Impact Ratio</h6>
            </div>
            <div style={{ height: 300 }}><Pie data={priorityData} options={pieOptions} /></div>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Workload + Priority Completion */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-6">
          <div className="stat-card glass-panel p-5 h-100 border-warning border-opacity-10 shadow-lg">
            <div className="d-flex align-items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-warning" />
              <h6 className="fw-black text-white text-uppercase tracking-widest mb-0" style={{ fontSize: 11 }}>Operative Workload (hrs logged)</h6>
            </div>
            <div style={{ height: 280 }}>
              <Bar data={workloadData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="stat-card glass-panel p-5 h-100 border-success border-opacity-10 shadow-lg">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Activity size={20} className="text-success" />
              <h6 className="fw-black text-white text-uppercase tracking-widest mb-0" style={{ fontSize: 11 }}>Priority vs Completion Matrix</h6>
            </div>
            <div style={{ height: 280 }}>
              <Bar data={priorityCompletionData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      {userTaskCounts.length > 0 && (
        <div className="stat-card glass-panel p-5 border-warning border-opacity-10 shadow-lg mb-5">
          <div className="d-flex align-items-center gap-3 mb-5">
            <div className="p-3 rounded-4 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 shadow-lg">
              <Users size={24} />
            </div>
            <div>
              <h5 className="fw-black text-white mb-1">Team Performance Overview</h5>
              <p className="text-secondary small mb-0 font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>Operative Contribution Matrix</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-dark table-hover border-transparent align-middle">
              <thead>
                <tr className="border-secondary border-opacity-10">
                  <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Operative</th>
                  <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Assigned</th>
                  <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Completed</th>
                  <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Success Rate</th>
                  <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Hours Logged</th>
                </tr>
              </thead>
              <tbody>
                {userTaskCounts.map(u => (
                  <tr key={u.name} className="border-secondary border-opacity-5">
                    <td className="py-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar px-1 py-1 rounded-circle bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: 36, height: 36, fontSize: 12 }}>
                          {u.name?.charAt(0)}
                        </div>
                        <span className="fw-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3" style={{ fontSize: 10 }}>{u.assigned}</span></td>
                    <td><span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-10 px-3" style={{ fontSize: 10 }}>{u.completed}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress bg-dark rounded-pill" style={{ width: 80, height: 6 }}>
                          <div className="progress-bar bg-success rounded-pill" style={{ width: u.assigned ? Math.round((u.completed/u.assigned)*100)+'%' : '0%' }}></div>
                        </div>
                        <span className="text-success fw-bold" style={{ fontSize: 10 }}>{u.assigned ? Math.round((u.completed/u.assigned)*100) : 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge px-3 fw-bold ${u.hours > 0 ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10' : 'bg-dark text-muted'}`} style={{ fontSize: 10 }}>
                        {u.hours}h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Audit Table */}
      <div className="stat-card glass-panel p-5 border-info border-opacity-10 shadow-lg overflow-hidden relative">
        <div className="d-flex align-items-center gap-3 mb-5">
          <div className="p-3 rounded-4 bg-info bg-opacity-10 text-info border border-info border-opacity-25 shadow-lg"><Activity size={24} /></div>
          <div>
            <h5 className="fw-black text-white mb-1">Global Audit Sequence</h5>
            <p className="text-secondary small mb-0 font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>Operational Transaction Log</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover border-transparent align-middle">
            <thead>
              <tr className="border-secondary border-opacity-10">
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Resource</th>
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Assignee</th>
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Status</th>
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Priority</th>
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Spent Time</th>
                <th className="fw-bold tracking-widest text-uppercase py-4" style={{ fontSize: 10, color: '#475569' }}>Execution Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 15).map(t => {
                const assignee = users.find(u => u.id === t.assigneeId);
                return (
                  <tr key={t.taskId} className="border-secondary border-opacity-5">
                    <td className="py-4">
                      <div className="fw-bold text-white mb-1">{t.title}</div>
                      <div className="text-secondary small tracking-widest uppercase font-bold" style={{ fontSize: 8 }}>ID: {t.taskId?.substring(0, 8)}</div>
                    </td>
                    <td>
                      {assignee ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar rounded-circle bg-dark border border-primary border-opacity-25 d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: 28, height: 28, fontSize: 10 }}>{assignee.fullName?.charAt(0)}</div>
                          <span className="small text-white fw-bold" style={{ fontSize: 11 }}>{assignee.fullName}</span>
                        </div>
                      ) : <span className="text-muted small" style={{ fontSize: 10 }}>Unassigned</span>}
                    </td>
                    <td>
                      <span className={`badge border px-3 rounded-pill bg-dark bg-opacity-25 font-bold uppercase tracking-widest ${t.status === 3 ? 'text-success border-success border-opacity-25' : (t.status === 4 ? 'text-danger border-danger border-opacity-25' : t.status === 2 ? 'text-info border-info border-opacity-25' : 'text-primary border-primary border-opacity-25')}`} style={{ fontSize: 9 }}>
                        {t.status === 3 ? 'Done' : t.status === 4 ? 'Overdue' : t.status === 2 ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge border px-3 rounded-pill font-bold uppercase tracking-widest ${t.priority === 3 ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25' : (t.priority === 1 ? 'bg-secondary bg-opacity-10 text-muted border-secondary border-opacity-25' : 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25')}`} style={{ fontSize: 9 }}>
                        {t.priority === 3 ? 'High' : t.priority === 1 ? 'Low' : 'Medium'}
                      </span>
                    </td>
                    <td>
                      <div className="text-secondary small font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>{t.totalHours || 0}h Recorded</div>
                    </td>
                    <td>
                      <div className="text-secondary small font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Continuous'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
