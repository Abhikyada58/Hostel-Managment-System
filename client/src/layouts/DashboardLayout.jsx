import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, AlertCircle, ShoppingBag, Droplets, 
  Coffee, Zap, CreditCard, 
  Bell, User, LogOut, Menu, X, BarChart2, ChevronRight,
  Sun, Moon
} from 'lucide-react';

const getStudentLinks = () => [
  { name: 'Dashboard', path: '/student/dashboard', icon: Home },
  { name: 'My Problems', path: '/student/problems', icon: AlertCircle },
  { name: 'Item Requests', path: '/student/items', icon: ShoppingBag },
  { name: 'Laundry', path: '/student/laundry', icon: Droplets },
  { name: 'Food & Mess', path: '/student/food', icon: Coffee },
  { name: 'Electricity Bill', path: '/student/electricity', icon: Zap },
  { name: 'Hostel Fees', path: '/student/fees', icon: CreditCard },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Profile', path: '/profile', icon: User },
];

const getAdminLinks = () => [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'Reports & Logs', path: '/admin/reports', icon: BarChart2 },
  { name: 'Students', path: '/admin/students', icon: User },
  { name: 'Profile', path: '/profile', icon: User },
];

const getWorkerProblemLinks = () => [
  { name: 'Dashboard', path: '/worker/problems', icon: AlertCircle },
  { name: 'Profile', path: '/profile', icon: User },
];

const getWorkerLaundryLinks = () => [
  { name: 'Item Requests', path: '/worker/items', icon: ShoppingBag },
  { name: 'Laundry', path: '/worker/laundry', icon: Droplets },
  { name: 'Profile', path: '/profile', icon: User },
];

const getCookLinks = () => [
  { name: 'Cook Dashboard', path: '/cook/dashboard', icon: Coffee },
  { name: 'Profile', path: '/profile', icon: User },
];

const getAccountantLinks = () => [
  { name: 'Dashboard', path: '/accountant/dashboard', icon: CreditCard },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let links = [];
  if (profile?.role === 'student') links = getStudentLinks();
  else if (profile?.role === 'admin') links = getAdminLinks();
  else if (profile?.role === 'worker_problem') links = getWorkerProblemLinks();
  else if (profile?.role === 'worker_laundry') links = getWorkerLaundryLinks();
  else if (profile?.role === 'cook') links = getCookLinks();
  else if (profile?.role === 'accountant') links = getAccountantLinks();

  const handleLogout = async () => { await signOut(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ─── SIDEBAR ─────────────────────────── */}
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '272px', flexShrink: 0 }}
      >
        {/* Logo */}
        <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'var(--accent-gradient)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px var(--accent-glow), 3px 3px 0 rgba(0,0,0,0.25)'
              }}>
                <Home size={20} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>HostelApp</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Management</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: 'var(--text-muted)', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden',
              background: 'var(--badge-accent-bg)',
              border: '2px solid var(--nav-active-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{profile?.name?.charAt(0) || 'U'}</span>
              }
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name || 'User'}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-link)' }}>
                {profile?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0.875rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{link.name}</span>
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid var(--divider)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '14px',
              color: 'var(--error-color)', fontWeight: 600, fontSize: '0.875rem',
              background: 'var(--error-bg)', border: '1.5px solid var(--error-border)',
              cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            <LogOut size={18} strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header className="app-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--card-border)',
                borderRadius: '10px', padding: '8px', color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                Welcome back
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {profile?.name?.split(' ')[0]} 👋
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search bar */}
            <div className="hidden md:flex" style={{
              alignItems: 'center', gap: '0.5rem',
              background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
              borderRadius: '12px', padding: '0.5rem 1rem'
            }}>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '0.875rem', width: '160px',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                padding: '10px',
                background: 'var(--card-bg)', border: '1.5px solid var(--card-border)',
                borderRadius: '12px', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: isDark ? 'none' : 'var(--neo-shadow)'
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <Link to="/notifications" style={{
              position: 'relative', padding: '10px',
              background: 'var(--card-bg)', border: '1.5px solid var(--card-border)',
              borderRadius: '12px', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none'
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute', top: '9px', right: '9px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ef4444', border: '2px solid var(--app-bg)'
              }} />
            </Link>

            {/* Avatar */}
            <Link to="/profile" style={{
              width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer',
              boxShadow: '0 4px 16px var(--accent-glow), var(--neo-shadow)',
              flexShrink: 0, textDecoration: 'none'
            }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{profile?.name?.charAt(0) || 'U'}</span>
              }
            </Link>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
