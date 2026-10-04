import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ShoppingBag, Droplets, Zap, CreditCard, Coffee, ArrowUpRight, Bell, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, gradient, linkTo, tag }) => (
  <Link to={linkTo} style={{ textDecoration: 'none' }}>
    <div
      className="glass-card"
      style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px',
        background: gradient, borderRadius: '50%',
        filter: 'blur(40px)', opacity: 0.25, pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: gradient, opacity: 0.9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: `0 8px 20px rgba(0,0,0,0.2), 3px 3px 0 rgba(0,0,0,0.15)`
        }}>
          <Icon size={20} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ArrowUpRight size={14} color="var(--text-muted)" strokeWidth={2.5} />
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-label)', marginBottom: '0.35rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </div>
      {tag && (
        <div style={{
          marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.25rem 0.65rem', borderRadius: '999px',
          background: 'var(--badge-accent-bg)', border: '1px solid var(--badge-accent-border)',
          fontSize: '0.65rem', fontWeight: 700, color: 'var(--badge-accent-color)', letterSpacing: '0.05em'
        }}>
          {tag}
        </div>
      )}
    </div>
  </Link>
);

export default function StudentDashboard() {
  const { profile } = useAuth();

  const stats = {
    pendingProblems: 1,
    laundryStatus: 'Washing',
    pendingItems: 0,
    electricityBill: '₹640',
    hostelFees: '₹14,000',
    todaysMenu: 'Paneer, Roti'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ─── HERO BANNER ─────────────────────────── */}
      <div style={{
        borderRadius: '24px', overflow: 'hidden', position: 'relative',
        background: 'var(--nav-active-bg)',
        border: '1.5px solid var(--nav-active-border)',
        padding: '2.5rem 2rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem'
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '30%', width: '180px', height: '180px', background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-link)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Student Overview</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--nav-active-color)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Room {profile?.room_number || '—'}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {profile?.name} &nbsp;·&nbsp; Active Student
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/fees" className="accent-btn" style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
            <CreditCard size={16} /> Pay Dues
          </Link>
          <Link to="/student/problems" className="neo-btn" style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
            <AlertCircle size={16} /> Report
          </Link>
        </div>
      </div>

      {/* ─── STAT CARDS ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard title="Problems" value={stats.pendingProblems} icon={AlertCircle}
          gradient="linear-gradient(135deg, #ef4444, #dc2626)" linkTo="/student/problems" tag="1 Pending" />
        <StatCard title="Laundry" value={stats.laundryStatus} icon={Droplets}
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)" linkTo="/student/laundry" tag="In Progress" />
        <StatCard title="Item Requests" value={stats.pendingItems} icon={ShoppingBag}
          gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" linkTo="/student/items" tag="All Clear" />
        <StatCard title="Pending Fees" value={stats.hostelFees} icon={CreditCard}
          gradient="linear-gradient(135deg, #f97316, #ea580c)" linkTo="/student/fees" tag="Due Soon" />
        <StatCard title="Electricity" value={stats.electricityBill} icon={Zap}
          gradient="linear-gradient(135deg, #eab308, #ca8a04)" linkTo="/student/electricity" tag="Oct Bill" />
        <StatCard title="Today's Dinner" value={stats.todaysMenu} icon={Coffee}
          gradient="linear-gradient(135deg, #10b981, #059669)" linkTo="/student/food" tag="Fresh" />
      </div>

      {/* ─── BOTTOM ROW ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', paddingBottom: '2rem' }}>

        {/* Recent Updates */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Recent Updates</div>
            <Link to="/notifications" style={{
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--badge-accent-color)',
              background: 'var(--badge-accent-bg)', padding: '0.3rem 0.75rem', borderRadius: '999px',
              border: '1px solid var(--badge-accent-border)', textDecoration: 'none'
            }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: Zap, color: 'var(--warning-color)', bg: 'var(--warning-bg)', title: 'Electricity Bill Generated', sub: 'October bill ready · ₹640 · Due in 5 days', border: 'var(--warning-border)' },
              { icon: Droplets, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'Laundry Collected', sub: 'Currently being washed — expected tomorrow', border: 'rgba(59,130,246,0.2)' },
              { icon: CheckCircle, color: 'var(--success-color)', bg: 'var(--success-bg)', title: 'Problem Resolved', sub: 'Bathroom tap issue marked solved', border: 'var(--success-border)' },
            ].map(({ icon: Icon, color, bg, title, sub, border }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem',
                background: bg, borderRadius: '14px',
                border: `1.5px solid ${border}`
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', height: 'calc(100% - 3rem)' }}>

            <Link to="/student/problems" style={{ textDecoration: 'none' }}>
              <div style={{
                border: '2px dashed var(--input-border)', borderRadius: '18px', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '130px'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--input-focus-border)'; e.currentTarget.style.background = 'var(--nav-link-hover-bg)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--input-border)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <AlertCircle size={30} color="var(--text-muted)" strokeWidth={2} style={{ marginBottom: '0.625rem' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Report Problem</span>
              </div>
            </Link>

            <Link to="/student/fees" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--accent-gradient)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '18px', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s ease', minHeight: '130px',
                boxShadow: '0 8px 24px var(--accent-glow), 3px 3px 0 rgba(0,0,0,0.2)'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px var(--accent-glow), 4px 4px 0 rgba(0,0,0,0.25)'; e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-glow), 3px 3px 0 rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'none'; }}
              >
                <CreditCard size={30} color="#fff" strokeWidth={2.5} style={{ marginBottom: '0.625rem' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Pay Fees</span>
              </div>
            </Link>

            <Link to="/student/laundry" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
                borderRadius: '18px', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '90px'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.borderColor = 'var(--input-border)'; }}
              >
                <Droplets size={24} color="var(--text-muted)" strokeWidth={2} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Laundry</span>
              </div>
            </Link>

            <Link to="/student/food" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
                borderRadius: '18px', padding: '1.5rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '90px'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.borderColor = 'var(--input-border)'; }}
              >
                <Coffee size={24} color="var(--text-muted)" strokeWidth={2} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Food Menu</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
