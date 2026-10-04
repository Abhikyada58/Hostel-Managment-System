import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Droplets } from 'lucide-react';

export default function LaundryWorkerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_requests')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching laundry:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending_pickup':      return 'badge badge-pending';
      case 'washing':             return 'badge badge-progress';
      case 'ready_for_delivery':  return 'badge badge-progress';
      case 'delivered':           return 'badge badge-done';
      case 'completed':           return 'badge badge-done';
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
          <h1 className="page-title">Worker Dashboard</h1>
          <p className="page-subtitle">Manage laundry pickup & delivery for students</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Droplets size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No laundry requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Student</th>
                  <th>Clothes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.room_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{req.profiles?.name || 'Unknown'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{req.clothes_count} items</td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td>
                      {req.status !== 'completed' && (
                        <button
                          onClick={() => setSelectedRequest(req)}
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
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              Manage Laundry Request
            </h2>

            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Room:</strong> {selectedRequest.room_number}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Student:</strong> {selectedRequest.profiles?.name}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Clothes:</strong> {selectedRequest.clothes_count} pieces
              </p>
              {selectedRequest.notes && (
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {selectedRequest.notes}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedRequest.status === 'pending_pickup' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'washing')}
                  className="accent-btn"
                >
                  Confirm Pickup &amp; Start Washing
                </button>
              )}
              {selectedRequest.status === 'washing' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'ready_for_delivery')}
                  className="accent-btn"
                >
                  Mark as Ready for Delivery
                </button>
              )}
              {selectedRequest.status === 'ready_for_delivery' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'delivered')}
                  className="accent-btn"
                >
                  Mark as Delivered to Room
                </button>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="neo-btn"
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
