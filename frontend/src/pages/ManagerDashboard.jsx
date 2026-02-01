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
            fetchData(); // Refresh data
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
            fetchData(); // Refresh data
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
        return <div className="spinner"></div>;
    }

    const pendingCount = leaves.filter(l => l.status === 'pending').length;
    const approvedCount = leaves.filter(l => l.status === 'approved').length;
    const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-brand">Leave Management</div>
                <div className="navbar-user">
                    <span style={{ fontWeight: 500 }}>{user?.name}</span>
                    <span className="badge badge-manager">{user?.role}</span>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container">
                <h2>Manager Dashboard</h2>

                {/* Stats */}
                <div className="grid grid-3 mb-4">
                    <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>
                            {pendingCount}
                        </div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>
                            {approvedCount}
                        </div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
                        <div className="stat-value" style={{ color: 'var(--danger)' }}>
                            {rejectedCount}
                        </div>
                        <div className="stat-label">Rejected</div>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                {/* Leave Requests */}
                <div className="glass-container mb-4">
                    <div className="flex-between mb-3">
                        <h3>Leave Requests</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`btn btn-sm ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    {leaves.length === 0 ? (
                        <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>
                            No leave requests found
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{leave.employeeId?.name}</div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
                                                        {leave.employeeId?.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                            <td>{leave.numberOfDays}</td>
                                            <td>{leave.reason}</td>
                                            <td>{leave.employeeId?.leaveBalance || 0} days</td>
                                            <td>
                                                <span className={`badge badge-${leave.status}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td>
                                                {leave.status === 'pending' ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleApprove(leave._id)}
                                                            className="btn btn-success btn-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(leave._id)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                                                        {leave.reviewedBy?.name}
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
                <div className="glass-container">
                    <h3>Employee Leave Balances</h3>

                    {balances.length === 0 ? (
                        <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>
                            No employees found
                        </p>
                    ) : (
                        <div className="grid grid-3">
                            {balances.map((employee) => (
                                <div key={employee._id} className="card">
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {employee.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>
                                        {employee.email}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {employee.leaveBalance} days
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
                                        Available leave
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
