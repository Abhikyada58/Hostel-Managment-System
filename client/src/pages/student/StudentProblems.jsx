import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Plus, X, AlertCircle } from 'lucide-react';

export default function StudentProblems() {
  const { profile } = useAuth();
  const [problems, setProblems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    category: 'Electrical',
    priority: 'low',
    description: ''
  });

  useEffect(() => {
    fetchProblems();
  }, [profile]);

  const fetchProblems = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('problems').insert([{
        student_id: profile.id,
        room_number: profile.room_number || 'Unassigned',
        category: formData.category,
        priority: formData.priority,
        description: formData.description
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ category: 'Electrical', priority: 'low', description: '' });
      fetchProblems();
    } catch (error) {
      alert(error.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchProblems();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':    return 'badge badge-pending';
      case 'accepted':   return 'badge badge-progress';
      case 'in progress': return 'badge badge-progress';
      case 'solved':     return 'badge badge-done';
      case 'closed':     return 'badge badge-done';
      case 'reopened':   return 'badge badge-error';
      default:           return 'badge badge-pending';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    return priority === 'emergency' ? 'badge badge-error' : 'badge badge-pending';
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Problems</h1>
          <p className="page-subtitle">Track and manage maintenance issues in your room</p>
        </div>
        <button
          className="accent-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Report Problem
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading your problems...
          </div>
        ) : problems.length === 0 ? (
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>You haven't reported any problems yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((prob) => (
                  <tr key={prob.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(prob.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{prob.category}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prob.description}
                    </td>
                    <td>
                      <span className={getPriorityBadgeClass(prob.priority)} style={{ textTransform: 'capitalize' }}>
                        {prob.priority}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(prob.status)} style={{ textTransform: 'capitalize' }}>
                        {prob.status}
                      </span>
                    </td>
                    <td>
                      {prob.status === 'solved' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => updateStatus(prob.id, 'closed')}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--success-color)', fontWeight: 600,
                              fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem'
                            }}
                          >
                            ✓ Confirm Solved
                          </button>
                          <button
                            onClick={() => updateStatus(prob.id, 'reopened')}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--error-color)', fontWeight: 600,
                              fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem'
                            }}
                          >
                            ↩ Reopen
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                Report a Problem
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="glass-label">Category</label>
                <select
                  className="glass-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['Electrical', 'Plumbing', 'Fan', 'Light', 'AC', 'Furniture', 'Bathroom', 'Water', 'Internet', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="glass-label">Priority</label>
                <select
                  className="glass-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="glass-label">Description</label>
                <textarea
                  required
                  rows="4"
                  className="glass-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button type="submit" className="accent-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Submit Problem
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
