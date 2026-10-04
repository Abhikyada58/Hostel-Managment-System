import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Coffee, MessageSquare, Plus, X } from 'lucide-react';

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

export default function CookDashboard() {
  const [activeTab, setActiveTab] = useState('menu');

  const [menus, setMenus] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({
    menu_date: new Date().toISOString().split('T')[0],
    breakfast: '',
    lunch: '',
    dinner: '',
    notes: ''
  });

  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: 'in_progress',
    cook_response: ''
  });

  useEffect(() => {
    if (activeTab === 'menu') fetchMenus();
    else fetchComplaints();
  }, [activeTab]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_menus')
        .select('*')
        .order('menu_date', { ascending: false });
      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_complaints')
        .select('*, profiles(name, room_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('food_menus').upsert([{
        menu_date: menuForm.menu_date,
        breakfast: menuForm.breakfast,
        lunch: menuForm.lunch,
        dinner: menuForm.dinner,
        notes: menuForm.notes
      }], { onConflict: 'menu_date' });
      if (error) throw error;
      setIsMenuModalOpen(false);
      fetchMenus();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveResponse = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('food_complaints')
        .update({ status: responseForm.status, cook_response: responseForm.cook_response })
        .eq('id', selectedComplaint.id);
      if (error) throw error;
      setIsResponseModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  const openResponseModal = (comp) => {
    setSelectedComplaint(comp);
    setResponseForm({ status: comp.status, cook_response: comp.cook_response || '' });
    setIsResponseModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      pending: 'badge badge-pending',
      in_progress: 'badge badge-progress',
      resolved: 'badge badge-done',
      closed: 'badge badge-done',
    };
    return map[status] || 'badge';
  };

  const getTypeBadgeStyle = (type) => {
    if (type === 'complaint') return { background: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)' };
    if (type === 'suggestion') return { background: 'var(--badge-accent-bg)', color: 'var(--badge-accent-color)', border: '1px solid var(--badge-accent-border)' };
    return { background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' };
  };

  const formatText = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Cook Dashboard</h1>
          <p className="page-subtitle">Manage daily menus and student feedback</p>
        </div>
        {activeTab === 'menu' && (
          <button
            className="accent-btn"
            onClick={() => {
              setMenuForm({ menu_date: new Date().toISOString().split('T')[0], breakfast: '', lunch: '', dinner: '', notes: '' });
              setIsMenuModalOpen(true);
            }}
          >
            <Plus size={18} style={{ marginRight: '0.4rem', display: 'inline' }} />
            Add / Update Menu
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--divider)' }}>
        {[
          { key: 'menu', label: 'Manage Menus', icon: <Coffee size={16} /> },
          { key: 'complaints', label: 'Student Feedback', icon: <MessageSquare size={16} /> },
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

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading menus…</div>
          ) : menus.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Coffee size={48} style={{ color: 'var(--card-border)' }} />
              <p>No menus added yet. Click "Add / Update Menu" to create one.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="glass-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {new Date(menu.menu_date).toLocaleDateString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{menu.breakfast}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{menu.lunch}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{menu.dinner}</td>
                      <td>
                        <button
                          className="neo-btn"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                          onClick={() => {
                            setMenuForm({
                              menu_date: menu.menu_date,
                              breakfast: menu.breakfast,
                              lunch: menu.lunch,
                              dinner: menu.dinner,
                              notes: menu.notes || ''
                            });
                            setIsMenuModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading feedback…</div>
          ) : complaints.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <MessageSquare size={48} style={{ color: 'var(--card-border)' }} />
              <p>No queries or complaints from students yet.</p>
            </div>
          ) : (
            <div>
              {complaints.map((comp, i) => (
                <div
                  key={comp.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: i < complaints.length - 1 ? '1px solid var(--divider)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-row)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{
                        ...getTypeBadgeStyle(comp.type),
                        padding: '0.2rem 0.6rem',
                        borderRadius: '0.4rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {comp.type}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {comp.profiles?.name || 'Student'} (Room: {comp.profiles?.room_number || 'TBD'})
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(comp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={getStatusBadgeClass(comp.status)}>
                      {formatText(comp.status)}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.6 }}>{comp.message}</p>

                  {comp.cook_response && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Your Reply: </strong>{comp.cook_response}
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--divider)' }}>
                    <button
                      onClick={() => openResponseModal(comp)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-link)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {comp.cook_response ? 'Edit Response' : 'Reply & Update Status'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Daily Menu</h2>
              <button onClick={() => setIsMenuModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="glass-label">Date</label>
                <input type="date" className="glass-input" style={{ width: '100%' }}
                  value={menuForm.menu_date} onChange={(e) => setMenuForm({ ...menuForm, menu_date: e.target.value })} required />
              </div>
              <div>
                <label className="glass-label">Breakfast</label>
                <textarea rows="2" className="glass-input" style={{ width: '100%', resize: 'vertical' }}
                  value={menuForm.breakfast} onChange={(e) => setMenuForm({ ...menuForm, breakfast: e.target.value })} required />
              </div>
              <div>
                <label className="glass-label">Lunch</label>
                <textarea rows="2" className="glass-input" style={{ width: '100%', resize: 'vertical' }}
                  value={menuForm.lunch} onChange={(e) => setMenuForm({ ...menuForm, lunch: e.target.value })} required />
              </div>
              <div>
                <label className="glass-label">Dinner</label>
                <textarea rows="2" className="glass-input" style={{ width: '100%', resize: 'vertical' }}
                  value={menuForm.dinner} onChange={(e) => setMenuForm({ ...menuForm, dinner: e.target.value })} required />
              </div>
              <div>
                <label className="glass-label">Special Notes (Optional)</label>
                <input type="text" className="glass-input" style={{ width: '100%' }}
                  value={menuForm.notes} onChange={(e) => setMenuForm({ ...menuForm, notes: e.target.value })} />
              </div>
              <div style={{ paddingTop: '0.5rem' }}>
                <button type="submit" className="accent-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Respond to Student</h2>
              <button onClick={() => setIsResponseModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveResponse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="glass-label">Update Status</label>
                <select className="glass-input" style={{ width: '100%' }}
                  value={responseForm.status} onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="glass-label">Your Reply</label>
                <textarea rows="4" className="glass-input" style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Enter response to the student…"
                  value={responseForm.cook_response}
                  onChange={(e) => setResponseForm({ ...responseForm, cook_response: e.target.value })}
                  required />
              </div>
              <div style={{ paddingTop: '0.25rem' }}>
                <button type="submit" className="accent-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Response</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
