import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Plus, X, Droplets, CheckCircle } from 'lucide-react';

export default function StudentLaundry() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    clothes_count: 1,
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_requests')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching laundry requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('laundry_requests').insert([{
        student_id: profile.id,
        room_number: profile.room_number || 'Unassigned',
        clothes_count: parseInt(formData.clothes_count),
        notes: formData.notes
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ clothes_count: 1, notes: '' });
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const confirmReceived = async (id) => {
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending_pickup':      return 'badge badge-pending';
      case 'washing':             return 'badge badge-progress';
      case 'ready_for_delivery':  return 'badge badge-accent';
      case 'delivered':           return 'badge badge-accent';
      case 'completed':           return 'badge badge-done';
      default:                    return 'badge badge-pending';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Laundry Service</h1>
          <p className="page-subtitle">Schedule pickups and track your laundry status</p>
        </div>
        <button
          className="accent-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Request Pickup
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <Droplets size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>You haven't requested any laundry pickups yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items of Clothing</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{req.clothes_count} pieces</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.notes || '—'}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td>
                      {req.status === 'delivered' && (
                        <button
                          onClick={() => confirmReceived(req.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--success-color)', fontWeight: 600,
                            fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem'
                          }}
                        >
                          <CheckCircle size={15} />
                          Confirm Received
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                Request Laundry Pickup
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
                <label className="glass-label">Number of Clothes</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="glass-input"
                  value={formData.clothes_count}
                  onChange={(e) => setFormData({ ...formData, clothes_count: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="glass-label">Special Instructions (Optional)</label>
                <textarea
                  rows="3"
                  className="glass-input"
                  style={{ resize: 'vertical' }}
                  placeholder="E.g., Please wash white shirts separately"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="accent-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Schedule Pickup
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
