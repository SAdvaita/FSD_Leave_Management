import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

const EmployeeDashboard = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Attendance state
    const [attendanceStatus, setAttendanceStatus] = useState({
        clockedIn: false,
        clockedOut: false,
        attendance: null
    });
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState({ type: '', text: '' });

    // Profile picture state
    const [uploadingPic, setUploadingPic] = useState(false);
    const [picMessage, setPicMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            navigate('/login');
            return;
        }
        fetchData();
        fetchAttendanceStatus();
        fetchAttendanceHistory();
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

    const fetchAttendanceStatus = async () => {
        try {
            const res = await api.get('/attendance/status');
            setAttendanceStatus(res.data);
        } catch (error) {
            console.error('Error fetching attendance status:', error);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const res = await api.get('/attendance/my-history');
            setAttendanceHistory(res.data.history);
        } catch (error) {
            console.error('Error fetching attendance history:', error);
        }
    };

    const handleClockIn = async () => {
        setAttendanceLoading(true);
        setAttendanceMessage({ type: '', text: '' });
        try {
            const res = await api.post('/attendance/clock-in');
            setAttendanceMessage({ type: 'success', text: res.data.message });
            fetchAttendanceStatus();
            fetchAttendanceHistory();
        } catch (error) {
            setAttendanceMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to clock in'
            });
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleClockOut = async () => {
        setAttendanceLoading(true);
        setAttendanceMessage({ type: '', text: '' });
        try {
            const res = await api.post('/attendance/clock-out');
            setAttendanceMessage({ type: 'success', text: res.data.message });
            fetchAttendanceStatus();
            fetchAttendanceHistory();
        } catch (error) {
            setAttendanceMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to clock out'
            });
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        setUploadingPic(true);
        setPicMessage({ type: '', text: '' });
        try {
            const res = await api.post('/profile/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPicMessage({ type: 'success', text: res.data.message });
            setUser(prev => ({ ...prev, profilePicture: res.data.user.profilePicture }));
        } catch (error) {
            setPicMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload profile picture'
            });
        } finally {
            setUploadingPic(false);
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

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString();
    };

    const getProfilePicUrl = () => {
        if (user?.profilePicture) {
            return `${API_BASE}/${user.profilePicture}`;
        }
        return null;
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-brand">Leave Management</div>
                <div className="navbar-user">
                    <div className="profile-avatar-small" onClick={() => setActiveTab('profile')}>
                        {getProfilePicUrl() ? (
                            <img src={getProfilePicUrl()} alt="Profile" />
                        ) : (
                            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                    </div>
                    <span style={{ fontWeight: 500 }}>{user?.name}</span>
                    <span className="badge badge-employee">{user?.role}</span>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container">
                <h2>Employee Dashboard</h2>

                {/* Tab Navigation */}
                <div className="tab-nav mb-4">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        🕐 Attendance
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leave')}
                    >
                        📝 Apply Leave
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📋 Leave History
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-3 mb-4">
                            <div className="stat-card">
                                <div className="stat-value">{balance?.leaveBalance || 0}</div>
                                <div className="stat-label">Available Leave Days</div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                                <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                                    {leaves.length}
                                </div>
                                <div className="stat-label">Total Leave Requests</div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                                <div className="stat-value" style={{ color: 'var(--success)' }}>
                                    {attendanceStatus.clockedIn ? (attendanceStatus.clockedOut ? '✅' : '🟢') : '⭕'}
                                </div>
                                <div className="stat-label">
                                    {attendanceStatus.clockedIn
                                        ? (attendanceStatus.clockedOut ? 'Shift Complete' : 'Currently Working')
                                        : 'Not Clocked In'}
                                </div>
                            </div>
                        </div>

                        {/* Quick Clock In/Out */}
                        <div className="glass-container mb-4">
                            <h3>⏰ Quick Clock In / Out</h3>
                            {attendanceMessage.text && (
                                <div className={`alert alert-${attendanceMessage.type === 'success' ? 'success' : 'error'}`}>
                                    {attendanceMessage.text}
                                </div>
                            )}
                            <div className="attendance-actions">
                                {!attendanceStatus.clockedIn && (
                                    <button
                                        onClick={handleClockIn}
                                        className="btn btn-success btn-clock"
                                        disabled={attendanceLoading}
                                    >
                                        🟢 Clock In
                                    </button>
                                )}
                                {attendanceStatus.clockedIn && !attendanceStatus.clockedOut && (
                                    <>
                                        <div className="clock-info">
                                            <span className="clock-pulse"></span>
                                            <span>Clocked in at {formatTime(attendanceStatus.attendance?.clockIn)}</span>
                                        </div>
                                        <button
                                            onClick={handleClockOut}
                                            className="btn btn-danger btn-clock"
                                            disabled={attendanceLoading}
                                        >
                                            🔴 Clock Out
                                        </button>
                                    </>
                                )}
                                {attendanceStatus.clockedOut && (
                                    <div className="clock-complete">
                                        <p>✅ Shift complete for today!</p>
                                        <p className="clock-detail">
                                            In: {formatTime(attendanceStatus.attendance?.clockIn)} |
                                            Out: {formatTime(attendanceStatus.attendance?.clockOut)} |
                                            Hours: {attendanceStatus.attendance?.totalHours}h
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ===== ATTENDANCE TAB ===== */}
                {activeTab === 'attendance' && (
                    <>
                        <div className="glass-container mb-4">
                            <h3>🕐 Today's Attendance</h3>
                            {attendanceMessage.text && (
                                <div className={`alert alert-${attendanceMessage.type === 'success' ? 'success' : 'error'}`}>
                                    {attendanceMessage.text}
                                </div>
                            )}
                            <div className="attendance-card-large">
                                <div className="attendance-status-icon">
                                    {attendanceStatus.clockedIn
                                        ? (attendanceStatus.clockedOut ? '✅' : '🟢')
                                        : '⭕'}
                                </div>
                                <div className="attendance-status-text">
                                    {attendanceStatus.clockedIn
                                        ? (attendanceStatus.clockedOut ? 'Shift Complete' : 'Currently Working')
                                        : 'Not Clocked In Yet'}
                                </div>

                                {attendanceStatus.attendance && (
                                    <div className="attendance-detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Clock In</span>
                                            <span className="detail-value">{formatTime(attendanceStatus.attendance.clockIn)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Clock Out</span>
                                            <span className="detail-value">{formatTime(attendanceStatus.attendance.clockOut)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Total Hours</span>
                                            <span className="detail-value">{attendanceStatus.attendance.totalHours || 0}h</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status</span>
                                            <span className={`badge badge-${attendanceStatus.attendance.status}`}>
                                                {attendanceStatus.attendance.status}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="attendance-actions mt-3">
                                    {!attendanceStatus.clockedIn && (
                                        <button onClick={handleClockIn} className="btn btn-success btn-clock" disabled={attendanceLoading}>
                                            🟢 Clock In Now
                                        </button>
                                    )}
                                    {attendanceStatus.clockedIn && !attendanceStatus.clockedOut && (
                                        <button onClick={handleClockOut} className="btn btn-danger btn-clock" disabled={attendanceLoading}>
                                            🔴 Clock Out Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Attendance History */}
                        <div className="glass-container">
                            <h3>📅 Attendance History (Last 30 Days)</h3>
                            {attendanceHistory.length === 0 ? (
                                <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem' }}>
                                    No attendance records yet
                                </p>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Clock In</th>
                                                <th>Clock Out</th>
                                                <th>Total Hours</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceHistory.map((record) => (
                                                <tr key={record._id}>
                                                    <td>{formatDate(record.date)}</td>
                                                    <td>{formatTime(record.clockIn)}</td>
                                                    <td>{formatTime(record.clockOut)}</td>
                                                    <td>{record.totalHours}h</td>
                                                    <td>
                                                        <span className={`badge badge-${record.status}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== APPLY LEAVE TAB ===== */}
                {activeTab === 'leave' && (
                    <div className="glass-container mb-4">
                        <h3>📝 Apply for Leave</h3>
                        <div className="alert alert-info mb-3">
                            You have <strong>{balance?.leaveBalance || 0}</strong> leave days remaining
                        </div>

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
                )}

                {/* ===== LEAVE HISTORY TAB ===== */}
                {activeTab === 'history' && (
                    <div className="glass-container">
                        <h3>📋 My Leave Requests</h3>

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
                )}

                {/* ===== PROFILE TAB ===== */}
                {activeTab === 'profile' && (
                    <div className="glass-container">
                        <h3>👤 My Profile</h3>

                        {picMessage.text && (
                            <div className={`alert alert-${picMessage.type === 'success' ? 'success' : 'error'}`}>
                                {picMessage.text}
                            </div>
                        )}

                        <div className="profile-section">
                            <div className="profile-avatar-large" onClick={() => fileInputRef.current?.click()}>
                                {getProfilePicUrl() ? (
                                    <img src={getProfilePicUrl()} alt="Profile" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className="avatar-overlay">
                                    {uploadingPic ? '⏳' : '📷'}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                onChange={handleProfilePicUpload}
                                style={{ display: 'none' }}
                            />
                            <p className="profile-hint">Click the avatar to upload a new profile picture</p>

                            <div className="profile-details">
                                <div className="profile-detail-item">
                                    <span className="profile-label">Name</span>
                                    <span className="profile-value">{user?.name}</span>
                                </div>
                                <div className="profile-detail-item">
                                    <span className="profile-label">Email</span>
                                    <span className="profile-value">{user?.email}</span>
                                </div>
                                <div className="profile-detail-item">
                                    <span className="profile-label">Role</span>
                                    <span className="profile-value">
                                        <span className="badge badge-employee">{user?.role}</span>
                                    </span>
                                </div>
                                <div className="profile-detail-item">
                                    <span className="profile-label">Leave Balance</span>
                                    <span className="profile-value">{user?.leaveBalance || balance?.leaveBalance || 0} days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
