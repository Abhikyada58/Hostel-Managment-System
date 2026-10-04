import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { AlertCircle } from 'lucide-react';

export default function ProblemWorkerDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [workerNote, setWorkerNote] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // We join with profiles to get the student's name
      const { data, error } = await supabase
        .from('problems')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: newStatus, worker_note: workerNote || null })
        .eq('id', id);
        
      if (error) throw error;
      
      setSelectedProblem(null);
      setWorkerNote('');
      fetchProblems(); // Refresh the list
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':   return 'badge badge-pending';
      case 'in progress': return 'badge badge-progress';
      case 'solved':    return 'badge badge-done';
      case 'closed':    return 'badge badge-done';
      case 'reopened':  return 'badge badge-error';
      case 'accepted':  return 'badge badge-progress';
      default:          return 'badge badge-pending';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Worker Dashboard</h1>
          <p className="page-subtitle">Manage & resolve reported maintenance problems</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading problems...
          </div>
        ) : problems.length === 0 ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No problems assigned to you.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((prob) => (
                  <tr key={prob.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prob.room_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{prob.profiles?.name || 'Unknown'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prob.category}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prob.description}</td>
                    <td>
                      <span className={getStatusBadgeClass(prob.status)} style={{ textTransform: 'capitalize' }}>
                        {prob.status}
                      </span>
                    </td>
                    <td>
                      {prob.status !== 'closed' && (
                        <button
                          onClick={() => setSelectedProblem(prob)}
                          style={{ color: 'var(--text-link)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedProblem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              Manage Problem
            </h2>

            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Room:</strong> {selectedProblem.room_number}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Category:</strong> {selectedProblem.category}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{selectedProblem.description}</p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="glass-label">Add Worker Note (Optional)</label>
              <textarea
                rows="2"
                className="glass-input"
                style={{ width: '100%', resize: 'vertical', fontFamily: "'Space Grotesk', sans-serif" }}
                placeholder="E.g., Need to buy a new wire..."
                value={workerNote}
                onChange={(e) => setWorkerNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <button
                onClick={() => updateStatus(selectedProblem.id, 'solved')}
                className="accent-btn"
              >
                Mark as Done
              </button>

              <button
                onClick={() => setSelectedProblem(null)}
                className="neo-btn"
                style={{ gridColumn: '1 / -1' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
