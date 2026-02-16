import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EmployeeDashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('overview');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [leavesRes, balanceRes, attendanceRes] = await Promise.all([
                api.get('/leaves/my-leaves'),
                api.get('/balance/my-balance'),
                api.get('/attendance/status')
            ]);
            setLeaves(leavesRes.data.leaves);
            setBalance(balanceRes.data.balance);
            setAttendance(attendanceRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/leaves/apply', formData);
            setMessage({ type: 'success', text: response.data.message });
            setFormData({ startDate: '', endDate: '', reason: '' });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to apply for leave'
            });
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (1MB limit)
        if (file.size > 1000000) {
            setMessage({ type: 'error', text: 'Image too large! Max size: 1MB' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type! Use JPG, PNG, or GIF' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/profile/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ type: 'success', text: 'Profile picture updated!' });
            await refreshUser();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to upload image';
            setMessage({ type: 'error', text: errorMsg });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleClockIn = async () => {
        try {
            const endpoint = attendance?.clockedIn ? '/attendance/clock-out' : '/attendance/clock-in';
            const response = await api.post(endpoint);
            setMessage({ type: 'success', text: response.data.message });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Action failed' });
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
                <div className="animate-pulse">Loading Premium Experience...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <nav className="navbar">
                <div className="navbar-brand">LeaveManager Pro</div>
                <div className="navbar-user" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'white', fontWeight: '600' }}>{user?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        LOGOUT
                    </button>
                </div>
            </nav>

            <div className="container">
                {/* Hero Section */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid var(--primary)',
                            background: 'rgba(255,255,255,0.1)'
                        }}>
                            {(() => {
                                console.log('🔍 DEBUG - User object:', user);
                                console.log('🔍 DEBUG - Profile picture value:', user?.profilePicture);
                                console.log('🔍 DEBUG - Image URL:', user?.profilePicture ? `http://localhost:8080/${user.profilePicture}?t=${new Date().getTime()}` : 'NO IMAGE');
                                return user?.profilePicture ? (
                                    <img
                                        src={`http://localhost:8080/${user.profilePicture}?t=${new Date().getTime()}`}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            console.error('❌ Image failed to load!', e.target.src);
                                            console.error('❌ Error event:', e);
                                        }}
                                        onLoad={() => console.log('✅ Image loaded successfully!')}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--primary)' }}>
                                        {user?.name.charAt(0)}
                                    </div>
                                );
                            })()}
                        </div>
                        <label htmlFor="file-upload" style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: uploading ? 'var(--text-muted)' : 'var(--secondary)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontSize: '1.2rem',
                            transition: 'all 0.3s ease',
                            opacity: uploading ? 0.6 : 1
                        }}>
                            {uploading ? '⏳' : '+'}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem' }}>
                            Welcome back, <span className="gradient-text">{user?.name.split(' ')[0]}</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Here is what's happening today.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
                    <div className="glass-card">
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Available Balance</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {balance?.leaveBalance || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Days Remaining</div>
                    </div>

                    <div className="glass-card">
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Used Leaves</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                            {balance?.usedLeaves || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Days Taken</div>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <div className="animate-pulse" style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                            {attendance?.clockedOut ? "You're done for today!" :
                                attendance?.clockedIn ? "Currently Working" : "Ready to punch in?"}
                        </div>
                        {!attendance?.clockedOut && (
                            <button
                                onClick={handleClockIn}
                                className={`btn ${attendance?.clockedIn ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ width: '100%' }}
                            >
                                {attendance?.clockedIn ? "Clock Out" : "Clock In"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Apply Leave Form */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3>Request Time Off</h3>
                        {message.text && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem',
                                background: message.type === 'success' ? 'rgba(0, 176, 155, 0.2)' : 'rgba(239, 71, 58, 0.2)',
                                border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                                color: 'white'
                            }}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="glass-input"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="glass-input"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Reason</label>
                                <textarea
                                    name="reason"
                                    className="glass-input"
                                    rows="3"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    placeholder="I need a break because..."
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Submit Request
                            </button>
                        </form>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3>Recent History</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {leaves.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No leave history found.</p>
                            ) : (
                                leaves.map((leave) => (
                                    <div key={leave._id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{leave.numberOfDays} Day{leave.numberOfDays > 1 ? 's' : ''} Leave</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: leave.status === 'approved' ? 'rgba(0, 176, 155, 0.2)' :
                                                    leave.status === 'rejected' ? 'rgba(239, 71, 58, 0.2)' : 'rgba(247, 183, 51, 0.2)',
                                                color: leave.status === 'approved' ? 'var(--success)' :
                                                    leave.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                                                border: `1px solid ${leave.status === 'approved' ? 'var(--success)' :
                                                    leave.status === 'rejected' ? 'var(--error)' : 'var(--warning)'}`
                                            }}>
                                                {leave.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
