import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Users, AlertCircle, CreditCard, Megaphone, Plus, Trash2, CheckCircle, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, notices
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({ totalStudents: 0, pendingProblems: 0, totalFees: 0 });
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  
  // Notice Form State
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', target_audience: 'all' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        // Simple mock stats for now (in a real app, use count queries)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
        {activeTab === 'notices' && (
          <button onClick={() => setShowNoticeForm(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} /><span>Post Notice</span>
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Overview</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Manage Users</button>
        <button onClick={() => setActiveTab('notices')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'notices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Notice Board</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg mr-4"><Users size={32} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 bg-red-50 text-red-600 rounded-lg mr-4"><AlertCircle size={32} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Complaints</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingProblems}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 bg-green-50 text-green-600 rounded-lg mr-4"><Shield size={32} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <h3 className="text-2xl font-bold text-gray-900">Online</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Current Role</th>
                    <th className="p-4 font-medium">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="p-4 text-sm text-gray-500">{u.email}</td>
                      <td className="p-4 text-sm font-bold uppercase">{u.role}</td>
                      <td className="p-4 text-sm">
                        <select 
                          className="border rounded px-2 py-1 text-sm bg-white"
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

      {activeTab === 'notices' && (
        <div className="space-y-4">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : notices.length === 0 ? <div className="p-12 text-center text-gray-500 bg-white rounded-xl">No notices posted.</div> : (
            notices.map(notice => (
              <div key={notice.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{notice.content}</p>
                  <p className="text-xs text-gray-400 mt-4 uppercase">Target: {notice.target_audience}</p>
                </div>
                <button onClick={() => handleDeleteNotice(notice.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Post New Notice</h2>
            <form onSubmit={handlePostNotice} className="space-y-4">
              <input type="text" placeholder="Title" required className="w-full border p-2 rounded" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} />
              <textarea placeholder="Notice Content..." required rows="4" className="w-full border p-2 rounded" value={noticeForm.content} onChange={e => setNoticeForm({...noticeForm, content: e.target.value})}></textarea>
              <select className="w-full border p-2 rounded" value={noticeForm.target_audience} onChange={e => setNoticeForm({...noticeForm, target_audience: e.target.value})}>
                <option value="all">Everyone</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowNoticeForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
