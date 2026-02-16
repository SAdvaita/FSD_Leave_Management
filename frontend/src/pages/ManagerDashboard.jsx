import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [balances, setBalances] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user || user.role !== 'manager') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, filter]);

    const fetchData = async () => {
        try {
            const filterParam = filter !== 'all' ? `?status=${filter}` : '';
            const [leavesRes, balancesRes] = await Promise.all([
                api.get(`/leaves/all${filterParam}`),
                api.get('/balance/all')
            ]);
            setLeaves(leavesRes.data.leaves);
            setBalances(balancesRes.data.employees);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leaveId) => {
        setMessage({ type: '', text: '' });
        try {
            const response = await api.put(`/leaves/${leaveId}/approve`);
            setMessage({ type: 'success', text: response.data.message });
            fetchData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to approve leave'
            });
        }
    };

    const handleReject = async (leaveId) => {
        setMessage({ type: '', text: '' });
        try {
            const response = await api.put(`/leaves/${leaveId}/reject`);
            setMessage({ type: 'success', text: response.data.message });
            fetchData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to reject leave'
            });
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
                <div className="animate-pulse">Loading Manager Portal...</div>
            </div>
        );
    }

    const pendingCount = leaves.filter(l => l.status === 'pending').length;
    const approvedCount = leaves.filter(l => l.status === 'approved').length;
    const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

    return (
        <div className="animate-fade-in">
            <nav className="navbar">
                <div className="navbar-brand">LeaveManager Admin</div>
                <div className="navbar-user" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'white', fontWeight: '600' }}>{user?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ADMIN</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        LOGOUT
                    </button>
                </div>
            </nav>

            <div className="container">
                <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    Dashboard Overview
                </h2>

                {/* Stats */}
                <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingCount}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Pending Requests</div>
                    </div>
                    <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{approvedCount}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Approved Requests</div>
                    </div>
                    <div className="glass-card" style={{ borderLeft: '4px solid var(--error)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--error)' }}>{rejectedCount}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Rejected Requests</div>
                    </div>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: message.type === 'success' ? 'rgba(0, 176, 155, 0.2)' : 'rgba(239, 71, 58, 0.2)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: 'white'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Leave Requests */}
                <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Leave Requests</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'pending', 'approved', 'rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', textTransform: 'capitalize' }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {leaves.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No requests found</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Employee</th>
                                        <th style={{ padding: '1rem' }}>Dates</th>
                                        <th style={{ padding: '1rem' }}>Reason</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600' }}>{leave.employeeId?.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leave.employeeId?.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(leave.startDate).toLocaleDateString()} - <br />
                                                {new Date(leave.endDate).toLocaleDateString()}
                                                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>({leave.numberOfDays} days)</div>
                                            </td>
                                            <td style={{ padding: '1rem', maxWidth: '300px' }}>{leave.reason}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    color: leave.status === 'approved' ? 'var(--success)' :
                                                        leave.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                                                    background: 'rgba(255,255,255,0.05)'
                                                }}>
                                                    {leave.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {leave.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleApprove(leave._id)}
                                                            className="btn"
                                                            style={{ background: 'var(--success)', border: 'none', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(leave._id)}
                                                            className="btn"
                                                            style={{ background: 'var(--error)', border: 'none', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            ✗
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                        Reviewed by {leave.reviewedBy?.name || 'Admin'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Employee Balances */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3>Employee Balances</h3>
                    <div className="grid grid-3" style={{ marginTop: '1rem' }}>
                        {balances.map((employee) => (
                            <div key={employee._id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{employee.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{employee.email}</div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {employee.leaveBalance}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
