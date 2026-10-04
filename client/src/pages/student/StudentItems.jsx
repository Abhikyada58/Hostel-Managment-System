import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Plus, X, ShoppingBag, CheckCircle } from 'lucide-react';

const ITEM_LIST = ['Bucket', 'Pillow', 'Bedsheet', 'Mattress', 'Blanket', 'Chair', 'Table', 'Hanger', 'Dustbin', 'Other'];

export default function StudentItems() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    item_name: 'Bucket',
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('item_requests')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching item requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('item_requests').insert([{
        student_id: profile.id,
        room_number: profile.room_number || 'Unassigned',
        item_name: formData.item_name,
        quantity: parseInt(formData.quantity),
        reason: formData.reason
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ item_name: 'Bucket', quantity: 1, reason: '' });
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const confirmReceived = async (id) => {
    try {
      const { error } = await supabase
        .from('item_requests')
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
      case 'pending':   return 'badge badge-pending';
      case 'accepted':  return 'badge badge-progress';
      case 'preparing': return 'badge badge-progress';
      case 'delivered': return 'badge badge-accent';
      case 'completed': return 'badge badge-done';
      default:          return 'badge badge-pending';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Item Requests</h1>
          <p className="page-subtitle">Request hostel items for your room</p>
        </div>
        <button
          className="accent-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Request Item
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
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>You haven't requested any items yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Reason</th>
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
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{req.item_name}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{req.quantity}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason || '—'}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)} style={{ textTransform: 'capitalize' }}>
                        {req.status}
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
                Request Item
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
                <label className="glass-label">Select Item</label>
                <select
                  className="glass-input"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                >
                  {ITEM_LIST.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="glass-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="glass-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div>
                <label className="glass-label">Reason (Optional)</label>
                <textarea
                  rows="3"
                  className="glass-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Why do you need this item?"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <button type="submit" className="accent-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
