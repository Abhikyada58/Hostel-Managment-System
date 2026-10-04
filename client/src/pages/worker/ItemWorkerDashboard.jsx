import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { ShoppingBag } from 'lucide-react';

export default function ItemWorkerDashboard() {
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
        .from('item_requests')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('item_requests')
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
      case 'pending':   return 'badge badge-pending';
      case 'accepted':  return 'badge badge-progress';
      case 'preparing': return 'badge badge-progress';
      case 'delivered': return 'badge badge-done';
      case 'completed': return 'badge badge-done';
      default:          return 'badge badge-pending';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Worker Dashboard</h1>
          <p className="page-subtitle">Manage item requests from students</p>
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
            <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No item requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Student</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.room_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{req.profiles?.name || 'Unknown'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.item_name}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{req.quantity}</td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)} style={{ textTransform: 'capitalize' }}>
                        {req.status}
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
              Manage Item Request
            </h2>

            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Room:</strong> {selectedRequest.room_number}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Student:</strong> {selectedRequest.profiles?.name}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Item:</strong> {selectedRequest.item_name} (x{selectedRequest.quantity})
              </p>
              {selectedRequest.reason && (
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Reason:</strong> {selectedRequest.reason}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedRequest.status === 'pending' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'accepted')}
                  className="accent-btn"
                >
                  Accept Request
                </button>
              )}
              {selectedRequest.status === 'accepted' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'preparing')}
                  className="accent-btn"
                >
                  Start Preparing
                </button>
              )}
              {selectedRequest.status === 'preparing' && (
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'delivered')}
                  className="accent-btn"
                >
                  Mark as Delivered
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
