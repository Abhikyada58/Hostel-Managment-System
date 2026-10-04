import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Download, BarChart2, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);
  const [problems, setProblems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: payData } = await supabase.from('payment_history').select('*');
      setPayments(payData || []);

      const { data: probData } = await supabase.from('problems').select('id, category, status');
      setProblems(probData || []);

      const { data: auditData } = await supabase.from('audit_logs').select('*, profiles(name)').order('created_at', { ascending: false }).limit(100);
      setAuditLogs(auditData || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Process Data for Charts ---
  const paymentMethodData = [
    { name: 'Cash', value: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount), 0) },
    { name: 'UPI', value: payments.filter(p => p.method === 'upi').reduce((sum, p) => sum + parseFloat(p.amount), 0) }
  ];
  const COLORS = ['#635bff', '#00C49F', '#FFBB28', '#FF8042'];

  const problemStatusData = [
    { name: 'Pending', count: problems.filter(p => p.status === 'pending').length },
    { name: 'In Progress', count: problems.filter(p => p.status === 'in_progress').length },
    { name: 'Solved', count: problems.filter(p => p.status === 'solved').length },
    { name: 'Closed', count: problems.filter(p => p.status === 'closed').length },
  ];

  // --- CSV Export Functions ---
  const downloadCSV = (filename, data) => {
    if (!data || !data.length) return alert("No data to export.");
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(k => `"${row[k]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPayments = () => {
    const formatted = payments.map(p => ({
      ID: p.id,
      Type: p.type,
      Amount: p.amount,
      Method: p.method,
      Date: new Date(p.created_at).toLocaleString()
    }));
    downloadCSV("Payments_Report", formatted);
  };

  const exportAuditLogs = () => {
    const formatted = auditLogs.map(a => ({
      Date: new Date(a.created_at).toLocaleString(),
      User: a.profiles?.name || 'Unknown',
      Action: a.action,
      Entity: a.entity,
      Entity_ID: a.entity_id
    }));
    downloadCSV("Audit_Logs", formatted);
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
      Loading Reports…
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-subtitle">System-wide insights and audit trails</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="neo-btn" onClick={exportPayments} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Payments
          </button>
          <button className="neo-btn" onClick={exportAuditLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--divider)' }}>
        {[
          { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
          { key: 'audit', label: 'Audit Logs', icon: <Activity size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...TAB_STYLE_BASE,
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue by Method */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Revenue Collection (Method)
            </h3>
            <div style={{ height: '256px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                    {paymentMethodData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', color: 'var(--text-primary)', borderRadius: '0.5rem' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Problems Pipeline */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Maintenance Pipeline
            </h3>
            <div style={{ height: '256px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', color: 'var(--text-primary)', borderRadius: '0.5rem' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent System Activity</h2>
          </div>
          {auditLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity logged.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="glass-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity Affected</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.profiles?.name || 'System'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</td>
                      <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{log.entity.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
