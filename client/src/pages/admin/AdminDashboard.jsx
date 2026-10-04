import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Users, AlertCircle, Shield, Plus, Trash2 } from 'lucide-react';

const TAB_STYLE_BASE = {
  padding: '0.75rem 1.5rem',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: '0.875rem',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
  transition: 'all 0.2s',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalStudents: 0, pendingProblems: 0, totalFees: 0 });
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', target_audience: 'all' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: problemCount } = await supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        setStats({ totalStudents: studentCount || 0, pendingProblems: problemCount || 0, totalFees: 0 });
      } else if (activeTab === 'users') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setUsers(data || []);
      } else if (activeTab === 'notices') {
        const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
        setNotices(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('notices').insert([noticeForm]);
      if (error) throw error;
      setShowNoticeForm(false);
      setNoticeForm({ title: '', content: '', target_audience: 'all' });
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const ROLES = ['student', 'admin', 'worker_problem', 'worker_laundry', 'cook', 'accountant'];

  const statCards = [
    {
      icon: <Users size={28} />,
      label: 'Total Students',
      value: stats.totalStudents,
      accent: 'var(--accent)',
    },
    {
      icon: <AlertCircle size={28} />,
      label: 'Pending Complaints',
      value: stats.pendingProblems,
      accent: 'var(--warning-color, #f59e0b)',
    },
    {
      icon: <Shield size={28} />,
      label: 'System Status',
      value: 'Online',
      accent: 'var(--success-color, #10b981)',
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Administrator Dashboard</h1>
          <p className="page-subtitle">Manage users, notices, and system overview</p>
        </div>
        {activeTab === 'notices' && (
          <button className="accent-btn" onClick={() => setShowNoticeForm(true)}>
            <Plus size={18} style={{ marginRight: '0.4rem', display: 'inline' }} />
            Post Notice
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--divider)', gap: '0' }}>
        {['overview', 'users', 'notices'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...TAB_STYLE_BASE,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Manage Users' : 'Notice Board'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                padding: '0.85rem',
                borderRadius: '0.75rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: card.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  {card.label}
                </p>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {card.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="glass-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className="badge badge-accent" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{u.role}</span>
                      </td>
                      <td>
                        <select
                          className="glass-input"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notices…</div>
          ) : notices.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notices posted yet.
            </div>
          ) : (
            notices.map(notice => (
              <div key={notice.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{notice.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{notice.content}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Target: {notice.target_audience}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  style={{ color: 'var(--error-color, #ef4444)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeForm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Post New Notice</h2>
            <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="glass-label">Title</label>
                <input
                  type="text"
                  placeholder="Notice title…"
                  required
                  className="glass-input"
                  style={{ width: '100%' }}
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="glass-label">Content</label>
                <textarea
                  placeholder="Notice content…"
                  required
                  rows="4"
                  className="glass-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={noticeForm.content}
                  onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                />
              </div>
              <div>
                <label className="glass-label">Target Audience</label>
                <select
                  className="glass-input"
                  style={{ width: '100%' }}
                  value={noticeForm.target_audience}
                  onChange={e => setNoticeForm({ ...noticeForm, target_audience: e.target.value })}
                >
                  <option value="all">Everyone</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="button" className="neo-btn" onClick={() => setShowNoticeForm(false)}>Cancel</button>
                <button type="submit" className="accent-btn">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
