import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [leavesRes, balanceRes] = await Promise.all([
                api.get('/leaves/my-leaves'),
                api.get('/balance/my-balance')
            ]);
            setLeaves(leavesRes.data.leaves);
            setBalance(balanceRes.data.balance);
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
            fetchData(); // Refresh data
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

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-brand">Leave Management</div>
                <div className="navbar-user">
                    <span style={{ fontWeight: 500 }}>{user?.name}</span>
                    <span className="badge badge-employee">{user?.role}</span>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container">
                <h2>Employee Dashboard</h2>

                {/* Stats */}
                <div className="grid grid-2 mb-4">
                    <div className="stat-card">
                        <div className="stat-value">{balance?.leaveBalance || 0}</div>
                        <div className="stat-label">Available Leave Days</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                        <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                            {leaves.length}
                        </div>
                        <div className="stat-label">Total Requests</div>
                    </div>
                </div>

                {/* Apply for Leave Form */}
                <div className="glass-container mb-4">
                    <h3>Apply for Leave</h3>

                    {message.text && (
                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reason">Reason</label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                placeholder="Please provide a reason for your leave request..."
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Submit Leave Request
                        </button>
                    </form>
                </div>

                {/* Leave Requests */}
                <div className="glass-container">
                    <h3>My Leave Requests</h3>

                    {leaves.length === 0 ? (
                        <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>
                            No leave requests yet
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Reviewed By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                            <td>{leave.numberOfDays}</td>
                                            <td>{leave.reason}</td>
                                            <td>
                                                <span className={`badge badge-${leave.status}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td>{leave.reviewedBy?.name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
