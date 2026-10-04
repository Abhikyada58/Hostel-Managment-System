import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Coffee, MessageSquare, Plus, CheckCircle, Clock, X } from 'lucide-react';

export default function StudentFood() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [menus, setMenus] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'query', message: '' });

  useEffect(() => {
    if (activeTab === 'menu') fetchMenus();
    else fetchComplaints();
  }, [activeTab, profile]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('food_menus').select('*').order('menu_date', { ascending: false }).limit(7);
      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('food_complaints').select('*').eq('student_id', profile.id).order('created_at', { ascending: false });
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('food_complaints').insert([{
        student_id: profile.id, type: formData.type, message: formData.message
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ type: 'query', message: '' });
      fetchComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatText = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Food & Mess</h1>
          <p className="page-subtitle">View weekly menus and submit feedback</p>
        </div>
        {activeTab === 'complaints' && (
          <button className="accent-btn" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Query
          </button>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid var(--card-border)', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '1rem 2rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'menu' ? '2px solid var(--badge-accent-color)' : '2px solid transparent',
            marginBottom: '-2px', color: activeTab === 'menu' ? 'var(--badge-accent-color)' : 'var(--text-muted)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <Coffee size={18} /> Weekly Menu
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          style={{
            padding: '1rem 2rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'complaints' ? '2px solid var(--badge-accent-color)' : '2px solid transparent',
            marginBottom: '-2px', color: activeTab === 'complaints' ? 'var(--badge-accent-color)' : 'var(--text-muted)',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={18} /> My Queries
        </button>
      </div>

      {activeTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading menu...</div> : menus.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Coffee size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>The cook hasn't posted the menu yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {menus.map((menu, idx) => (
                <div key={menu.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: idx === 0 ? '2px solid var(--badge-accent-border)' : undefined }}>
                  <div style={{ padding: '1.25rem', background: idx === 0 ? 'var(--badge-accent-bg)' : 'var(--input-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {new Date(menu.menu_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    {idx === 0 && <span style={{ color: 'var(--badge-accent-color)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Menu</span>}
                  </div>
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Breakfast</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{menu.breakfast}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Lunch</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{menu.lunch}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Dinner</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{menu.dinner}</div>
                    </div>
                    {menu.notes && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--card-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        "{menu.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="glass-card" style={{ padding: 0 }}>
          {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading...</div> : complaints.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>You haven't submitted any queries.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {complaints.map(comp => (
                <div key={comp.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${comp.type === 'complaint' ? 'badge-error' : comp.type === 'suggestion' ? 'badge-accent' : 'badge-progress'}`}>{comp.type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(comp.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`badge ${comp.status === 'resolved' ? 'badge-done' : comp.status === 'in_progress' ? 'badge-progress' : 'badge-pending'}`}>{formatText(comp.status)}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', fontWeight: 500 }}>{comp.message}</p>
                  
                  {comp.cook_response && (
                    <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success-color)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        <CheckCircle size={14} /> Cook's Response
                      </div>
                      <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.9rem' }}>{comp.cook_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Query</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="glass-label">Type</label>
                <select className="glass-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="query">General Query</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>
              <div>
                <label className="glass-label">Message</label>
                <textarea className="glass-input" rows="4" style={{ resize: 'vertical' }} placeholder="Describe your issue..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required />
              </div>
              <button type="submit" className="accent-btn" style={{ justifyContent: 'center' }}>Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
