import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    room_number: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // 1. Sign up the user without the SQL trigger
      const { data, error: signUpError } = await signUp(formData.email, formData.password, {
        name: formData.name,
        role: formData.role
      });

      if (signUpError) throw signUpError;

      // 2. If successful, explicitly create the profile in the database from React
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: formData.name || 'New User',
            email: formData.email,
            phone: formData.phone || null,
            room_number: formData.room_number || null,
            role: formData.role || 'student',
            status: 'active'
          }]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // We won't block the user, but we log it.
        }
      }

      // 3. Registration complete
      alert('Registration successful! Please sign in.');
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--app-bg)',
      padding: '2rem 1rem',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        {/* Logo / Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            boxShadow: 'var(--accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <UserPlus size={24} style={{ color: '#fff' }} />
          </div>
          <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Create Account</h1>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Register for hostel access</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error-color)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="glass-label">Full Name</label>
            <input
              name="name"
              type="text"
              required
              className="glass-input"
              style={{ width: '100%' }}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="glass-label">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="glass-input"
              style={{ width: '100%' }}
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Phone + Room */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label className="glass-label">Phone</label>
              <input
                name="phone"
                type="text"
                className="glass-input"
                style={{ width: '100%' }}
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="glass-label">Room Number</label>
              <input
                name="room_number"
                type="text"
                className="glass-input"
                style={{ width: '100%' }}
                placeholder="e.g. 205"
                value={formData.room_number}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="glass-label">Account Role</label>
            <select
              name="role"
              className="glass-input"
              style={{ width: '100%' }}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="worker_problem">Problem Maintenance Worker</option>
              <option value="worker_laundry">Laundry &amp; Item Worker</option>
              <option value="cook">Cook / Chef</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="glass-label">Password</label>
            <input
              name="password"
              type="password"
              required
              className="glass-input"
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="glass-label">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="glass-input"
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="accent-btn"
            style={{ marginTop: '0.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          {/* Link to login */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-link)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
