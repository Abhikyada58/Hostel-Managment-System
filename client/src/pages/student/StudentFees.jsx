import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { CreditCard, FileText, AlertCircle, Clock } from 'lucide-react';

export default function StudentFees() {
  const { profile } = useAuth();
  const [feeRecord, setFeeRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      // Fetch current fee record
      const { data: feeData, error: feeError } = await supabase
        .from('hostel_fees')
        .select('*')
        .eq('student_id', profile.id)
        .single();
        
      if (feeError && feeError.code !== 'PGRST116') throw feeError;
      setFeeRecord(feeData);

      // Fetch payment history
      const { data: historyData, error: historyError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    alert("UPI Payment Gateway integration will be added in the final phase! For now, please pay via cash at the Accountant's office.");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':        return 'badge badge-pending';
      case 'partially_paid': return 'badge badge-progress';
      case 'paid':           return 'badge badge-done';
      case 'overdue':        return 'badge badge-error';
      default:               return 'badge badge-pending';
    }
  };

  const formatText = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Hostel Fees &amp; Payments</h1>
        <p className="page-subtitle">Track your fee status and payment history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3">
        {/* Current Fee Overview — takes 2/3 */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CreditCard size={20} style={{ color: 'var(--accent)' }} />
              Current Academic Year Fees
            </h2>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading fee details...
              </div>
            ) : !feeRecord ? (
              <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p>Your fee structure has not been assigned yet.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Please contact the Accountant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Fee Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {/* Total Fees */}
                  <div style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Total Fees</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{feeRecord.total_fees}</p>
                  </div>
                  {/* Amount Paid */}
                  <div style={{
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Amount Paid</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-color)' }}>₹{feeRecord.amount_paid}</p>
                  </div>
                  {/* Pending */}
                  <div style={{
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--error-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Pending Balance</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--error-color)' }}>
                      ₹{(parseFloat(feeRecord.total_fees) - parseFloat(feeRecord.amount_paid)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Status + Pay Row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status:</span>
                      <span className={getStatusBadgeClass(feeRecord.status)} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {formatText(feeRecord.status)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} />
                      Due Date: <strong style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>{new Date(feeRecord.due_date).toLocaleDateString()}</strong>
                    </p>
                  </div>

                  {feeRecord.status !== 'paid' && (
                    <button
                      onClick={handlePayNow}
                      className="accent-btn"
                    >
                      Pay Pending Balance
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
            {/* Card Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--divider)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText size={20} style={{ color: 'var(--text-muted)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Payment History</h2>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No past payments found.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {history.map((record) => (
                  <li
                    key={record.id}
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--divider)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-row)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>₹{record.amount}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        background: 'var(--badge-accent-bg)',
                        color: 'var(--badge-accent-color)',
                        border: '1px solid var(--badge-accent-border)',
                        borderRadius: '4px',
                        padding: '2px 7px'
                      }}>
                        {record.method}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatText(record.type)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
