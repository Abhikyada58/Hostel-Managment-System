import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Droplets, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function StudentLaundry() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const disputeDelivery = async (id) => {
    const reason = prompt("Please provide a reason (e.g., 'I have not received my clothes'):");
    if (!reason) return;
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: 'disputed', dispute_reason: reason })
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
      case 'disputed':            return 'badge badge-error';
      default:                    return 'badge badge-pending';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Laundry Service</h1>
          <p className="page-subtitle">Track your laundry collected by workers</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <Droplets size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p>No laundry has been collected from your room yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date Collected</th>
                  <th>Photo</th>
                  <th>Items (approx)</th>
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
                    <td>
                      {req.image_url ? (
                        <a href={req.image_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-link)', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                          <ImageIcon size={16} /> View Photo
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No photo</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{req.clothes_count} pieces</td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td>
                      {req.status === 'delivered' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => confirmReceived(req.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--success-color)', fontWeight: 700, fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif"
                            }}
                          >
                            <CheckCircle size={15} /> Confirm
                          </button>
                          <button
                            onClick={() => disputeDelivery(req.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--error-color)', fontWeight: 700, fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif"
                            }}
                            title="I have not received my clothes"
                          >
                            <AlertTriangle size={15} /> Report Issue
                          </button>
                        </div>
                      )}
                      {req.status === 'disputed' && (
                        <span style={{ color: 'var(--error-color)', fontSize: '0.75rem', fontWeight: 700 }}>
                          Issue Reported
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
