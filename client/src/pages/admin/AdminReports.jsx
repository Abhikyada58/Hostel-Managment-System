import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Download, BarChart2, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, audit
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [payments, setPayments] = useState([]);
  const [problems, setProblems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Payments for charts
      const { data: payData } = await supabase.from('payment_history').select('*');
      setPayments(payData || []);

      // Fetch Problems for charts
      const { data: probData } = await supabase.from('problems').select('id, category, status');
      setProblems(probData || []);

      // Fetch Audit Logs
      const { data: auditData } = await supabase.from('audit_logs').select('*, profiles(name)').order('created_at', { ascending: false }).limit(100);
      setAuditLogs(auditData || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Process Data for Charts ---
  
  // 1. Payment Collection by Method
  const paymentMethodData = [
    { name: 'Cash', value: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount), 0) },
    { name: 'UPI', value: payments.filter(p => p.method === 'upi').reduce((sum, p) => sum + parseFloat(p.amount), 0) }
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 2. Problem Status Distribution
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <button onClick={exportPayments} className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            <Download size={18} /><span>Export Payments</span>
          </button>
          <button onClick={exportAuditLogs} className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
            <Download size={18} /><span>Export Audit Log</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          <BarChart2 size={18} className="inline mr-2" /> Analytics
        </button>
        <button onClick={() => setActiveTab('audit')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          <Activity size={18} className="inline mr-2" /> Audit Logs
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue by Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Collection (Method)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                    {paymentMethodData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Problems Pipeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Maintenance Pipeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FileText className="mr-2 text-gray-500" size={20} />
              Recent System Activity
            </h2>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No recent activity logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="p-4 font-medium">Timestamp</th>
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Entity Affected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{log.profiles?.name || 'System'}</td>
                      <td className="p-4 text-sm text-gray-900 font-medium">{log.action}</td>
                      <td className="p-4 text-sm text-gray-500 capitalize">{log.entity.replace('_', ' ')}</td>
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
