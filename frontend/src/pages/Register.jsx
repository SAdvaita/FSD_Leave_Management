import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const data = await register(formData.name, formData.email, formData.password, formData.role);
            if (data.user.role === 'employee') {
                navigate('/employee-dashboard');
            } else {
                navigate('/manager-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem 1rem' }}>
            {/* Background ambient light effects */}
            <div style={{ position: 'absolute', top: '10%', right: '20%', width: '350px', height: '350px', background: 'var(--primary)', filter: 'blur(150px)', opacity: '0.4', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '450px', height: '450px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: '0.3', borderRadius: '50%' }}></div>

            <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '500px', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join the team today</p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 71, 58, 0.2)',
                        border: '1px solid var(--error)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="glass-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="glass-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@company.com"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                        <select
                            name="role"
                            className="glass-input"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{ color: 'white' }}
                        >
                            <option value="employee" style={{ color: 'black' }}>Employee</option>
                            <option value="manager" style={{ color: 'black' }}>Manager</option>
                        </select>
                    </div>

                    <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                className="glass-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength="6"
                            />
                        </div>
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="glass-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
