import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

const LEAVE_TYPES = [
    { code: 'CL', name: 'Casual Leave', color: 'cl' },
    { code: 'SL', name: 'Sick Leave', color: 'sl' },
    { code: 'EL', name: 'Earned Leave', color: 'el' },
    { code: 'ML', name: 'Maternity Leave', color: 'ml', genderOnly: 'female' },
    { code: 'PL', name: 'Paternity Leave', color: 'pl', genderOnly: 'male' },
    { code: 'CO', name: 'Compensatory Off', color: 'co' },
    { code: 'LWP', name: 'Leave Without Pay', color: 'lwp' },
    { code: 'BL', name: 'Bereavement Leave', color: 'bl' },
    { code: 'SBL', name: 'Study/Exam Leave', color: 'sbl' },
];

const LEAVE_ICONS = { CL: '🏖️', SL: '🤒', EL: '🌴', ML: '🤱', PL: '👨‍👶', CO: '⏱️', LWP: '💼', BL: '🕊️', SBL: '📚' };
const NOTIF_ICONS = { leave_applied: '📋', leave_approved: '✅', leave_rejected: '❌', leave_cancelled: '🚫', general: '🔔' };

// Gender-aware leave type filter
const getFilteredLeaveTypes = (gender) => {
    return LEAVE_TYPES.filter(lt => !lt.genderOnly || lt.genderOnly === gender);
};

// Format balance — LWP shows as Unlimited
const fmtBalance = (code, value) => {
    if (code === 'LWP') return '∞';
    return value ?? 0;
};

const NAV = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'attendance', label: 'Attendance', icon: '🕐' },
    { id: 'apply', label: 'Apply Leave', icon: '✏️' },
    { id: 'history', label: 'Leave History', icon: '📋' },
    { id: 'calendar', label: 'Leave Calendar', icon: '📅' },
    { id: 'holidays', label: 'Holidays', icon: '🎉' },
    { id: 'salary', label: 'Salary', icon: '💰' },
    { id: 'notifs', label: 'Notifications', icon: '🔔' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
];

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────
const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const timeAgo = d => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────
const EmployeeDashboard = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [clock, setClock] = useState(new Date());

    // Data
    const [leaves, setLeaves] = useState([]);
    const [balances, setBalances] = useState({});
    const [attendance, setAttendance] = useState({ clockedIn: false, clockedOut: false, attendance: null });
    const [attHistory, setAttHistory] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Form state
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '', leaveType: 'CL', isHalfDay: false, halfDayType: 'first-half' });
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });

    // Attendance state
    const [attLoading, setAttLoading] = useState(false);
    const [attMsg, setAttMsg] = useState({ type: '', text: '' });

    // Profile state
    const [picUploading, setPicUploading] = useState(false);
    const [picMsg, setPicMsg] = useState({ type: '', text: '' });

    // Salary state
    const [salary, setSalary] = useState(null);
    const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth());
    const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());

    // Calendar state
    const [calDate, setCalDate] = useState(new Date());

    // Filters
    const [histFilter, setHistFilter] = useState('all');

    // Gender-filtered leave types
    const filteredLeaveTypes = getFilteredLeaveTypes(user?.gender || 'male');

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'employee') { navigate('/login'); return; }
        fetchAll();
    }, [user, navigate]);

    const fetchAll = async () => {
        try {
            const [leavesR, balR, attR, attHR, holR, notifR] = await Promise.all([
                api.get('/leaves/my-leaves'),
                api.get('/balance/my-balance'),
                api.get('/attendance/status'),
                api.get('/attendance/my-history'),
                api.get('/holidays'),
                api.get('/notifications'),
            ]);
            setLeaves(leavesR.data.leaves || []);
            setBalances(balR.data.balance?.leaveBalances || {});
            setAttendance(attR.data);
            setAttHistory(attHR.data.history || []);
            setHolidays(holR.data.holidays || []);
            setNotifs(notifR.data.notifications || []);
            setUnreadCount(notifR.data.unreadCount || 0);
            // Fetch salary for current month
            const now = new Date();
            fetchSalary(now.getMonth(), now.getFullYear());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchSalary = async (month, year) => {
        try {
            const r = await api.get(`/salary/my-salary?month=${month}&year=${year}`);
            setSalary(r.data.salary);
        } catch (e) { console.error('Salary fetch error:', e); }
    };

    const refetchLeaves = async () => {
        const r = await api.get('/leaves/my-leaves');
        setLeaves(r.data.leaves || []);
    };

    // ── Clock In / Out ──
    const handleClockIn = async () => {
        setAttLoading(true); setAttMsg({ type: '', text: '' });
        try {
            const r = await api.post('/attendance/clock-in');
            setAttMsg({ type: 'success', text: r.data.message });
            const [s, h] = await Promise.all([api.get('/attendance/status'), api.get('/attendance/my-history')]);
            setAttendance(s.data); setAttHistory(h.data.history || []);
        } catch (e) { setAttMsg({ type: 'error', text: e.response?.data?.message || 'Failed to clock in' }); }
        finally { setAttLoading(false); }
    };

    const handleClockOut = async () => {
        setAttLoading(true); setAttMsg({ type: '', text: '' });
        try {
            const r = await api.post('/attendance/clock-out');
            setAttMsg({ type: 'success', text: r.data.message });
            const [s, h] = await Promise.all([api.get('/attendance/status'), api.get('/attendance/my-history')]);
            setAttendance(s.data); setAttHistory(h.data.history || []);
            // If CO was granted, refresh balances and notifications
            if (r.data.coLeaveGranted) {
                const [balR, notifR] = await Promise.all([api.get('/balance/my-balance'), api.get('/notifications')]);
                setBalances(balR.data.balance?.leaveBalances || {});
                setNotifs(notifR.data.notifications || []);
                setUnreadCount(notifR.data.unreadCount || 0);
            }
        } catch (e) { setAttMsg({ type: 'error', text: e.response?.data?.message || 'Failed to clock out' }); }
        finally { setAttLoading(false); }
    };

    // ── Leave Submit ──
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setFormMsg({ type: '', text: '' });
        try {
            const r = await api.post('/leaves/apply', form);
            setFormMsg({ type: 'success', text: r.data.message });
            setForm({ startDate: '', endDate: '', reason: '', leaveType: 'CL', isHalfDay: false, halfDayType: 'first-half' });
            refetchLeaves();
            const balR = await api.get('/balance/my-balance');
            setBalances(balR.data.balance?.leaveBalances || {});
            // Refresh salary if LWP was applied
            if (form.leaveType === 'LWP') {
                fetchSalary(salaryMonth, salaryYear);
            }
        } catch (e) { setFormMsg({ type: 'error', text: e.response?.data?.message || 'Failed to submit' }); }
    };

    // ── Cancel Leave ──
    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await api.put(`/leaves/${id}/cancel`);
            refetchLeaves();
        } catch (e) { alert(e.response?.data?.message || 'Failed to cancel'); }
    };

    // ── Profile Pic ──
    const handlePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPicUploading(true); setPicMsg({ type: '', text: '' });
        try {
            const fd = new FormData();
            fd.append('image', file);
            const r = await api.post('/profile/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPicMsg({ type: 'success', text: r.data.message });
            setUser(prev => ({ ...prev, profilePicture: r.data.user.profilePicture }));
        } catch (e) { setPicMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed' }); }
        finally { setPicUploading(false); }
    };

    // ── Notifications ──
    const markAllRead = async () => {
        await api.put('/notifications/mark-all-read');
        setNotifs(n => n.map(x => ({ ...x, isRead: true })));
        setUnreadCount(0);
    };

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
        setUnreadCount(c => Math.max(0, c - 1));
    };

    // ── Calendar helpers ──
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const leaveDates = new Set(
        leaves.filter(l => l.status === 'approved').flatMap(l => {
            const dates = [];
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(d.toDateString());
            }
            return dates;
        })
    );

    const holidayDates = new Map(
        holidays.map(h => [new Date(h.date).toDateString(), h.name])
    );

    const calYear = calDate.getFullYear();
    const calMonth = calDate.getMonth();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const today = new Date().toDateString();

    const profilePicUrl = user?.profilePicture ? `${API_BASE}/${user.profilePicture}` : null;

    const filteredLeaves = histFilter === 'all' ? leaves : leaves.filter(l => l.status === histFilter);

    if (loading) return (
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    );

    // ── CURRENT TIME DISPLAY ──
    const nowTime = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const nowDate = clock.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="app-layout">
            {/* ========= SIDEBAR ========= */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🏢</div>
                    <div className="sidebar-logo-text">
                        <span className="sidebar-logo-name">E-Leave</span>
                        <span className="sidebar-logo-sub">Leave Management</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main Menu</div>
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${tab === item.id ? 'active' : ''}`}
                            onClick={() => setTab(item.id)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.id === 'notifs' && unreadCount > 0 && (
                                <span className="sidebar-badge">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {profilePicUrl
                                ? <img src={profilePicUrl} alt="Profile" />
                                : user?.name?.charAt(0)?.toUpperCase()
                            }
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                        <button className="sidebar-logout-btn" onClick={async () => { await logout(); navigate('/login'); }} title="Logout">⏏</button>
                    </div>
                </div>
            </aside>

            {/* ========= MAIN ========= */}
            <div className="main-content">
                {/* TOP NAV */}
                <div className="topnav">
                    <div className="topnav-left">
                        <div className="topnav-title">{NAV.find(n => n.id === tab)?.label}</div>
                        <div className="topnav-subtitle">{user?.department || 'General'} · {user?.designation || 'Employee'}</div>
                    </div>
                    <div className="topnav-right">
                        <span className="topnav-date">{nowDate}</span>
                        <button className="topnav-notif-btn" onClick={() => setTab('notifs')}>
                            🔔
                            {unreadCount > 0 && <span className="notif-dot"></span>}
                        </button>
                        <div className="avatar-sm">
                            {profilePicUrl
                                ? <img src={profilePicUrl} alt="Profile" />
                                : user?.name?.charAt(0)?.toUpperCase()
                            }
                        </div>
                    </div>
                </div>

                <div className="page-content">

                    {/* ============================================================ */}
                    {/* OVERVIEW TAB */}
                    {/* ============================================================ */}
                    {tab === 'overview' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Good {clock.getHours() < 12 ? 'Morning' : clock.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</div>
                                    <div className="page-subtitle">Here's your leave and attendance summary</div>
                                </div>
                                <button className="btn btn-primary" onClick={() => setTab('apply')}>
                                    + Apply Leave
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-icon stat-icon-blue">📋</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{leaves.length}</div>
                                        <div className="stat-label">Total Requests</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon stat-icon-amber">⏳</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
                                        <div className="stat-label">Pending</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon stat-icon-green">✅</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div>
                                        <div className="stat-label">Approved</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon stat-icon-purple">🕐</div>
                                    <div className="stat-info">
                                        <div className="stat-value">
                                            {attendance.clockedIn
                                                ? attendance.clockedOut ? 'Done' : 'Active'
                                                : 'In'}
                                        </div>
                                        <div className="stat-label">
                                            {attendance.clockedIn
                                                ? attendance.clockedOut ? 'Shift Complete' : 'Currently Working'
                                                : 'Not Clocked In'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Today's Attendance Quick-Action ── */}
                            <div className="card mb-5" style={{ overflow: 'hidden' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 24px',
                                    borderBottom: attendance.clockedIn || attendance.clockedOut ? '1px solid var(--border)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: attendance.clockedOut
                                                ? 'var(--success-light, #d1fae5)'
                                                : attendance.clockedIn
                                                    ? 'var(--primary-100, #e0e7ff)'
                                                    : 'var(--gray-100)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 20, flexShrink: 0
                                        }}>
                                            {attendance.clockedOut ? '✅' : attendance.clockedIn ? '🕐' : '⏰'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                                                Today's Attendance
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                                                {attendance.clockedOut
                                                    ? `Clocked in ${fmtTime(attendance.attendance?.clockIn)} → ${fmtTime(attendance.attendance?.clockOut)}`
                                                    : attendance.clockedIn
                                                        ? `Clocked in at ${fmtTime(attendance.attendance?.clockIn)} · Currently Working`
                                                        : 'You have not clocked in yet today'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        {attMsg.text && (
                                            <span style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: attMsg.type === 'success' ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)'
                                            }}>
                                                {attMsg.text}
                                            </span>
                                        )}
                                        {!attendance.clockedIn && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleClockIn}
                                                disabled={attLoading}
                                                style={{ minWidth: 110 }}
                                            >
                                                {attLoading ? '...' : '▶ Clock In'}
                                            </button>
                                        )}
                                        {attendance.clockedIn && !attendance.clockedOut && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={handleClockOut}
                                                disabled={attLoading}
                                                style={{ minWidth: 110 }}
                                            >
                                                {attLoading ? '...' : '■ Clock Out'}
                                            </button>
                                        )}
                                        {attendance.clockedOut && (
                                            <span style={{
                                                fontSize: 13, fontWeight: 700, color: 'var(--success, #16a34a)',
                                                background: 'var(--success-light, #d1fae5)', padding: '6px 14px',
                                                borderRadius: 20
                                            }}>
                                                Shift Complete · {attendance.attendance?.totalHours || 0}h
                                            </span>
                                        )}
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setTab('attendance')}
                                            style={{ fontSize: 12 }}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Leave Balances */}

                            <div className="card mb-5">
                                <div className="card-header-row">
                                    <div>
                                        <div className="card-title">Leave Balances</div>
                                        <div className="card-subtitle">Available leave days by type</div>
                                    </div>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setTab('apply')}>Apply Now</button>
                                </div>
                                <div className="card-body">
                                    <div className="leave-balance-grid">
                                        {filteredLeaveTypes.map(lt => (
                                            <div key={lt.code} className={`leave-balance-card lbc-${lt.color}`}>
                                                <div className="lbc-days">{lt.code === 'LWP' ? '∞' : (balances[lt.code] ?? '—')}</div>
                                                <div className="lbc-type">{LEAVE_ICONS[lt.code]} {lt.code}</div>
                                                <div className="lbc-name">{lt.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Leaves */}
                            <div className="card">
                                <div className="card-header-row">
                                    <div className="card-title">Recent Requests</div>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setTab('history')}>View All</button>
                                </div>
                                {leaves.slice(0, 5).length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📋</div>
                                        <div className="empty-title">No leave requests yet</div>
                                        <div className="empty-desc">Apply for your first leave using the Apply Leave tab</div>
                                    </div>
                                ) : (
                                    <div className="table-wrap">
                                        <table>
                                            <thead><tr>
                                                <th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th>
                                            </tr></thead>
                                            <tbody>
                                                {leaves.slice(0, 5).map(l => (
                                                    <tr key={l._id}>
                                                        <td>
                                                            <span className={`badge badge-${l.leaveType}`}>
                                                                {LEAVE_ICONS[l.leaveType]} {l.leaveType}
                                                            </span>
                                                        </td>
                                                        <td>{fmt(l.startDate)}</td>
                                                        <td>{fmt(l.endDate)}</td>
                                                        <td className="font-semibold">{l.numberOfDays}d{l.isHalfDay ? ' (½)' : ''}</td>
                                                        <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* ATTENDANCE TAB */}
                    {/* ============================================================ */}
                    {tab === 'attendance' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Attendance</div>
                                    <div className="page-subtitle">Track your daily work hours</div>
                                </div>
                            </div>

                            {/* Clock Widget */}
                            <div className="card mb-5">
                                <div className="clock-widget">
                                    <div className="clock-time-display">{nowTime}</div>
                                    <div className="clock-date-display">{nowDate}</div>

                                    {/* Status pill */}
                                    {!attendance.clockedIn && (
                                        <div className="clock-status-pill clock-status-idle">
                                            <span className="clock-pulse-dot"></span>
                                            Not Clocked In
                                        </div>
                                    )}
                                    {attendance.clockedIn && !attendance.clockedOut && (
                                        <div className="clock-status-pill clock-status-working">
                                            <span className="clock-pulse-dot"></span>
                                            Currently Working
                                        </div>
                                    )}
                                    {attendance.clockedOut && (
                                        <div className="clock-status-pill clock-status-done">
                                            ✅ Shift Complete
                                        </div>
                                    )}

                                    {attMsg.text && (
                                        <div className={`alert alert-${attMsg.type === 'success' ? 'success' : 'error'} mt-3`} style={{ maxWidth: 400, margin: '12px auto' }}>
                                            {attMsg.text}
                                        </div>
                                    )}

                                    <div className="clock-actions">
                                        {!attendance.clockedIn && (
                                            <button className="clock-in-btn" onClick={handleClockIn} disabled={attLoading}>
                                                ▶ Clock In
                                            </button>
                                        )}
                                        {attendance.clockedIn && !attendance.clockedOut && (
                                            <button className="clock-out-btn" onClick={handleClockOut} disabled={attLoading}>
                                                ■ Clock Out
                                            </button>
                                        )}
                                    </div>

                                    {attendance.attendance && (
                                        <div className="clock-summary-grid">
                                            <div className="clock-summary-item">
                                                <div className="clock-summary-label">Clock In</div>
                                                <div className="clock-summary-value">{fmtTime(attendance.attendance.clockIn)}</div>
                                            </div>
                                            <div className="clock-summary-item">
                                                <div className="clock-summary-label">Clock Out</div>
                                                <div className="clock-summary-value">{fmtTime(attendance.attendance.clockOut)}</div>
                                            </div>
                                            <div className="clock-summary-item">
                                                <div className="clock-summary-label">Total Hours</div>
                                                <div className="clock-summary-value">{attendance.attendance.totalHours || 0}h</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attendance History */}
                            <div className="card">
                                <div className="card-header-row">
                                    <div>
                                        <div className="card-title">Attendance History</div>
                                        <div className="card-subtitle">Last 30 days</div>
                                    </div>
                                </div>
                                {attHistory.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">🕐</div>
                                        <div className="empty-title">No attendance records yet</div>
                                    </div>
                                ) : (
                                    <div className="table-wrap">
                                        <table>
                                            <thead><tr>
                                                <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Total Hours</th><th>Status</th>
                                            </tr></thead>
                                            <tbody>
                                                {attHistory.map(r => (
                                                    <tr key={r._id}>
                                                        <td className="td-primary">{fmt(r.date)}</td>
                                                        <td>{fmtTime(r.clockIn)}</td>
                                                        <td>{fmtTime(r.clockOut)}</td>
                                                        <td className="font-semibold">{r.totalHours || 0}h</td>
                                                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* APPLY LEAVE TAB */}
                    {/* ============================================================ */}
                    {tab === 'apply' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Apply for Leave</div>
                                    <div className="page-subtitle">Submit a new leave request</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                                {/* Form */}
                                <div className="card">
                                    <div className="card-body">
                                        {formMsg.text && (
                                            <div className={`alert alert-${formMsg.type === 'success' ? 'success' : 'error'}`}>
                                                {formMsg.text}
                                            </div>
                                        )}
                                        <form onSubmit={handleLeaveSubmit}>

                                            <div className="form-group">
                                                <label className="form-label">Leave Type *</label>
                                                <select
                                                    className="form-control"
                                                    value={form.leaveType}
                                                    onChange={e => setForm({ ...form, leaveType: e.target.value })}
                                                >
                                                    {filteredLeaveTypes.map(lt => (
                                                        <option key={lt.code} value={lt.code}>
                                                            {LEAVE_ICONS[lt.code]} {lt.name} ({lt.code}) — Balance: {lt.code === 'LWP' ? 'Unlimited' : `${balances[lt.code] ?? 0} days`}
                                                        </option>
                                                    ))}
                                                </select>
                                                {form.leaveType === 'LWP' && (
                                                    <div style={{ marginTop: 8, padding: '10px 14px', background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e', border: '1px solid #fde68a' }}>
                                                        ⚠️ <strong>Leave Without Pay:</strong> This leave will deduct from your monthly salary. No balance restriction — available anytime.
                                                    </div>
                                                )}
                                                {form.leaveType === 'CO' && (
                                                    <div style={{ marginTop: 8, padding: '10px 14px', background: '#ecfdf5', borderRadius: 8, fontSize: 12, color: '#065f46', border: '1px solid #a7f3d0' }}>
                                                        ℹ️ <strong>Compensatory Off:</strong> CO is earned by working on public holidays. Current balance: <strong>{balances.CO ?? 0} days</strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid-2">
                                                <div className="form-group">
                                                    <label className="form-label">Start Date *</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={form.startDate}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">End Date *</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={form.endDate}
                                                        min={form.startDate || new Date().toISOString().split('T')[0]}
                                                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Half Day?</label>
                                                <div className="half-day-toggle">
                                                    <button
                                                        type="button"
                                                        className={`toggle-chip ${!form.isHalfDay ? 'selected' : ''}`}
                                                        onClick={() => setForm({ ...form, isHalfDay: false })}
                                                    >Full Day</button>
                                                    <button
                                                        type="button"
                                                        className={`toggle-chip ${form.isHalfDay && form.halfDayType === 'first-half' ? 'selected' : ''}`}
                                                        onClick={() => setForm({ ...form, isHalfDay: true, halfDayType: 'first-half' })}
                                                    >First Half</button>
                                                    <button
                                                        type="button"
                                                        className={`toggle-chip ${form.isHalfDay && form.halfDayType === 'second-half' ? 'selected' : ''}`}
                                                        onClick={() => setForm({ ...form, isHalfDay: true, halfDayType: 'second-half' })}
                                                    >Second Half</button>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Reason *</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={4}
                                                    placeholder="Please provide a detailed reason for your leave..."
                                                    value={form.reason}
                                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <button type="submit" className="btn btn-primary btn-lg w-full">
                                                Submit Leave Request
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Balance Sidebar */}
                                <div>
                                    <div className="card mb-4">
                                        <div className="card-header-row">
                                            <div className="card-title">Your Balances</div>
                                        </div>
                                        <div className="card-body" style={{ padding: '12px 20px' }}>
                                            {filteredLeaveTypes.map(lt => (
                                                <div key={lt.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                                    <span style={{ fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>
                                                        {LEAVE_ICONS[lt.code]} {lt.name}
                                                    </span>
                                                    <span style={{ fontWeight: 700, color: form.leaveType === lt.code ? 'var(--primary)' : 'var(--gray-800)' }}>
                                                        {lt.code === 'LWP' ? '∞ Unlimited' : `${balances[lt.code] ?? 0}d`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-header-row"><div className="card-title">ℹ️ Leave Policy</div></div>
                                        <div className="card-body" style={{ fontSize: 12.5, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                                            <p>• <b>CL</b>: Can be availed any time</p>
                                            <p>• <b>SL</b>: Medical certificate needed for 3+ days</p>
                                            <p>• <b>EL</b>: Requires 3-day advance notice</p>
                                            <p>• <b>LWP</b>: No balance restriction</p>
                                            <p>• Weekends & holidays are excluded</p>
                                            <p>• Overlapping leaves are not permitted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* LEAVE HISTORY TAB */}
                    {/* ============================================================ */}
                    {tab === 'history' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Leave History</div>
                                    <div className="page-subtitle">All your leave requests</div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header-row">
                                    <div className="filter-bar">
                                        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
                                            <button
                                                key={s}
                                                className={`filter-chip ${histFilter === s ? 'active' : ''}`}
                                                onClick={() => setHistFilter(s)}
                                            >
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                {s === 'all' ? ` (${leaves.length})` : ` (${leaves.filter(l => l.status === s).length})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filteredLeaves.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📋</div>
                                        <div className="empty-title">No {histFilter} leave requests</div>
                                    </div>
                                ) : (
                                    <div className="table-wrap">
                                        <table>
                                            <thead><tr>
                                                <th>Type</th><th>Start</th><th>End</th><th>Days</th>
                                                <th>Reason</th><th>Status</th><th>Reviewed By</th><th>Action</th>
                                            </tr></thead>
                                            <tbody>
                                                {filteredLeaves.map(l => (
                                                    <tr key={l._id}>
                                                        <td>
                                                            <span className={`badge badge-${l.leaveType}`}>
                                                                {LEAVE_ICONS[l.leaveType]} {l.leaveType}
                                                            </span>
                                                        </td>
                                                        <td>{fmt(l.startDate)}</td>
                                                        <td>{fmt(l.endDate)}</td>
                                                        <td className="font-semibold">{l.numberOfDays}{l.isHalfDay ? ' (½ day)' : 'd'}</td>
                                                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                                        <td>
                                                            <span className={`badge badge-${l.status}`}>{l.status}</span>
                                                            {l.rejectionReason && <div className="text-sm text-muted mt-1">Reason: {l.rejectionReason}</div>}
                                                        </td>
                                                        <td className="text-sm text-muted">{l.reviewedBy?.name || '—'}</td>
                                                        <td>
                                                            {['pending', 'approved'].includes(l.status) && (
                                                                <button className="btn btn-sm btn-danger" onClick={() => handleCancel(l._id)}>Cancel</button>
                                                            )}
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

                    {/* ============================================================ */}
                    {/* LEAVE CALENDAR TAB */}
                    {/* ============================================================ */}
                    {tab === 'calendar' && (
                        <>
                            <div className="page-header">
                                <div className="page-title">Leave Calendar</div>
                            </div>
                            <div className="card">
                                <div className="card-header-row">
                                    <div className="calendar-nav" style={{ padding: 0 }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setCalDate(new Date(calYear, calMonth - 1))}>‹</button>
                                        <div className="calendar-month-title">{MONTHS[calMonth]} {calYear}</div>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setCalDate(new Date(calYear, calMonth + 1))}>›</button>
                                    </div>
                                    <div className="flex gap-2">
                                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span> Today
                                        </span>
                                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-100)', display: 'inline-block' }}></span> On Leave
                                        </span>
                                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning-light)', display: 'inline-block' }}></span> Holiday
                                        </span>
                                    </div>
                                </div>
                                <div className="calendar-grid">
                                    {DAYS.map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
                                    {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="calendar-cell empty"></div>)}
                                    {Array(daysInMonth).fill(null).map((_, i) => {
                                        const day = i + 1;
                                        const dateObj = new Date(calYear, calMonth, day);
                                        const dateStr = dateObj.toDateString();
                                        const isToday = dateStr === today;
                                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                                        const isHoliday = holidayDates.has(dateStr);
                                        const isOnLeave = leaveDates.has(dateStr);
                                        let cls = 'calendar-cell';
                                        if (isToday) cls += ' today';
                                        else if (isHoliday) cls += ' holiday';
                                        else if (isOnLeave) cls += ' on-leave';
                                        else if (isWeekend) cls += ' weekend';
                                        return (
                                            <div key={day} className={cls} title={isHoliday ? holidayDates.get(dateStr) : isOnLeave ? 'On Leave' : ''}>
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* HOLIDAYS TAB */}
                    {/* ============================================================ */}
                    {tab === 'holidays' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Public Holidays</div>
                                    <div className="page-subtitle">{new Date().getFullYear()} Holiday Calendar</div>
                                </div>
                            </div>
                            <div className="card">
                                {holidays.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">🎉</div>
                                        <div className="empty-title">No holidays added yet</div>
                                        <div className="empty-desc">Your manager will add the holiday calendar</div>
                                    </div>
                                ) : holidays.map(h => {
                                    const d = new Date(h.date);
                                    return (
                                        <div key={h._id} className="holiday-item">
                                            <div className="holiday-date-badge">
                                                <div className="holiday-date-day">{d.getDate()}</div>
                                                <div className="holiday-date-month">{MONTHS[d.getMonth()].slice(0, 3)}</div>
                                            </div>
                                            <div>
                                                <div className="holiday-name">{h.name}</div>
                                                <div className="holiday-type-label">{h.type} holiday · {DAYS[d.getDay()]}, {d.getFullYear()}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* SALARY TAB */}
                    {/* ============================================================ */}
                    {tab === 'salary' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">💰 Salary Overview</div>
                                    <div className="page-subtitle">Monthly salary calculation with LWP deductions</div>
                                </div>
                            </div>

                            {/* Month Selector */}
                            <div className="card mb-5">
                                <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: 14 }}>Select Period:</div>
                                    <select className="form-control" style={{ width: 'auto' }}
                                        value={salaryMonth}
                                        onChange={e => { const m = parseInt(e.target.value); setSalaryMonth(m); fetchSalary(m, salaryYear); }}>
                                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <select className="form-control" style={{ width: 'auto' }}
                                        value={salaryYear}
                                        onChange={e => { const y = parseInt(e.target.value); setSalaryYear(y); fetchSalary(salaryMonth, y); }}>
                                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <button className="btn btn-primary" onClick={() => fetchSalary(salaryMonth, salaryYear)}>Refresh</button>
                                </div>
                            </div>

                            {salary ? (
                                <>
                                    {/* Salary Summary Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                                        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
                                            <div className="stat-icon stat-icon-blue">💼</div>
                                            <div className="stat-info">
                                                <div className="stat-value">₹{salary.baseSalary.toLocaleString('en-IN')}</div>
                                                <div className="stat-label">Base Monthly Salary</div>
                                            </div>
                                        </div>
                                        <div className="stat-card" style={{ borderLeft: salary.lwpDaysTaken > 0 ? '4px solid #dc2626' : '4px solid #16a34a' }}>
                                            <div className="stat-icon" style={{ background: salary.lwpDaysTaken > 0 ? '#fee2e2' : '#dcfce7' }}>💸</div>
                                            <div className="stat-info">
                                                <div className="stat-value" style={{ color: salary.lwpDaysTaken > 0 ? '#dc2626' : 'var(--gray-900)' }}>-₹{salary.lwpDeduction.toLocaleString('en-IN')}</div>
                                                <div className="stat-label">LWP Deduction ({salary.lwpDaysTaken}d)</div>
                                            </div>
                                        </div>
                                        <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
                                            <div className="stat-icon stat-icon-green">💰</div>
                                            <div className="stat-info">
                                                <div className="stat-value" style={{ color: '#16a34a' }}>₹{salary.netSalary.toLocaleString('en-IN')}</div>
                                                <div className="stat-label">Net Salary</div>
                                            </div>
                                        </div>
                                        <div className="stat-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                                            <div className="stat-icon" style={{ background: '#ede9fe' }}>⏱️</div>
                                            <div className="stat-info">
                                                <div className="stat-value" style={{ color: '#7c3aed' }}>{salary.coBalance}</div>
                                                <div className="stat-label">CO Days Balance</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Salary Breakdown Card */}
                                    <div className="card">
                                        <div className="card-header-row">
                                            <div>
                                                <div className="card-title">📊 Salary Breakdown — {salary.month} {salary.year}</div>
                                                <div className="card-subtitle">Detailed monthly calculation</div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {[
                                                { label: 'Employee Name', value: salary.employeeName },
                                                { label: 'Department', value: salary.department },
                                                { label: 'Designation', value: salary.designation },
                                                { label: 'Base Monthly Salary', value: `₹${salary.baseSalary.toLocaleString('en-IN')}` },
                                                { label: 'Working Days in Month', value: `${salary.workingDaysInMonth} days` },
                                                { label: 'Per Day Salary', value: `₹${salary.perDaySalary.toLocaleString('en-IN')}` },
                                                { label: 'LWP Days Taken', value: salary.lwpDaysTaken > 0 ? `${salary.lwpDaysTaken} day(s) ⚠️` : '0 days ✅' },
                                                { label: 'LWP Deduction', value: salary.lwpDeduction > 0 ? `-₹${salary.lwpDeduction.toLocaleString('en-IN')}` : '₹0', danger: salary.lwpDeduction > 0 },
                                                { label: '💰 Net Salary', value: `₹${salary.netSalary.toLocaleString('en-IN')}`, bold: true, green: true },
                                            ].map(({ label, value, danger, bold, green }) => (
                                                <div key={label} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '12px 0', borderBottom: '1px solid var(--gray-100)'
                                                }}>
                                                    <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: bold ? 700 : 500 }}>{label}</span>
                                                    <span style={{
                                                        fontSize: bold ? 16 : 13, fontWeight: bold ? 800 : 600,
                                                        color: green ? '#16a34a' : danger ? '#dc2626' : 'var(--gray-900)'
                                                    }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {salary.lwpDaysTaken > 0 && (
                                            <div style={{ padding: '12px 20px', background: '#fef3c7', borderTop: '1px solid #fde68a' }}>
                                                <div style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                                                    ⚠️ <strong>LWP Impact:</strong> You took {salary.lwpDaysTaken} day(s) of Leave Without Pay this month. ₹{salary.lwpDeduction.toLocaleString('en-IN')} has been deducted from your base salary of ₹{salary.baseSalary.toLocaleString('en-IN')}.
                                                </div>
                                            </div>
                                        )}
                                        {salary.coBalance > 0 && (
                                            <div style={{ padding: '12px 20px', background: '#ecfdf5', borderTop: '1px solid #a7f3d0' }}>
                                                <div style={{ fontSize: 12, color: '#065f46', fontWeight: 500 }}>
                                                    🎉 <strong>CO Leave Balance:</strong> You have {salary.coBalance} Compensatory Off day(s) earned by working on public holidays.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="card">
                                    <div className="empty-state">
                                        <div className="empty-icon">💰</div>
                                        <div className="empty-title">Loading salary data...</div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* NOTIFICATIONS TAB */}
                    {/* ============================================================ */}
                    {tab === 'notifs' && (
                        <>
                            <div className="page-header">
                                <div>
                                    <div className="page-title">Notifications</div>
                                    <div className="page-subtitle">{unreadCount} unread</div>
                                </div>
                                {unreadCount > 0 && (
                                    <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Mark all read</button>
                                )}
                            </div>
                            <div className="card">
                                {notifs.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">🔔</div>
                                        <div className="empty-title">No notifications</div>
                                        <div className="empty-desc">You're all caught up!</div>
                                    </div>
                                ) : notifs.map(n => (
                                    <div
                                        key={n._id}
                                        className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                        onClick={() => !n.isRead && markRead(n._id)}
                                    >
                                        <div className={`notification-icon notif-${n.type}`}>
                                            {NOTIF_ICONS[n.type] || '🔔'}
                                        </div>
                                        <div className="notification-body">
                                            <div className="notification-title">{n.title}</div>
                                            <div className="notification-message">{n.message}</div>
                                            <div className="notification-time">{timeAgo(n.createdAt)}</div>
                                        </div>
                                        {!n.isRead && (
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ============================================================ */}
                    {/* PROFILE TAB */}
                    {/* ============================================================ */}
                    {tab === 'profile' && (
                        <>
                            <div className="page-title mb-5">My Profile</div>

                            {picMsg.text && (
                                <div className={`alert alert-${picMsg.type === 'success' ? 'success' : 'error'}`}>{picMsg.text}</div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                                <div className="card">
                                    {/* Hero */}
                                    <div className="profile-hero">
                                        <div className="profile-avatar" onClick={() => fileInputRef.current?.click()}>
                                            {profilePicUrl
                                                ? <img src={profilePicUrl} alt="Profile" />
                                                : user?.name?.charAt(0)?.toUpperCase()
                                            }
                                            <div className="profile-avatar-overlay">{picUploading ? '⏳' : '📷'}</div>
                                        </div>
                                        <div className="profile-hero-info">
                                            <h2>{user?.name}</h2>
                                            <p>{user?.designation || 'Employee'} · {user?.department || 'General'}</p>
                                            <p style={{ marginTop: 4 }}>{user?.email}</p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handlePicUpload}
                                        style={{ display: 'none' }}
                                    />

                                    <div className="card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            {[
                                                { label: 'Full Name', value: user?.name },
                                                { label: 'Email', value: user?.email },
                                                { label: 'Role', value: user?.role },
                                                { label: 'Gender', value: user?.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Not set' },
                                                { label: 'Department', value: user?.department || 'General' },
                                                { label: 'Designation', value: user?.designation || 'Employee' },
                                                { label: 'Employee ID', value: user?.employeeId || 'N/A' },
                                                { label: 'Monthly Salary', value: user?.monthlySalary ? `₹${user.monthlySalary.toLocaleString('en-IN')}` : '₹30,000' },
                                            ].map(({ label, value }) => (
                                                <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)' }}>
                                                    <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginTop: 4 }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Balance sidebar */}
                                <div className="card">
                                    <div className="card-header-row"><div className="card-title">Leave Balances</div></div>
                                    <div className="card-body" style={{ padding: '12px 20px' }}>
                                        {filteredLeaveTypes.map(lt => (
                                            <div key={lt.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{LEAVE_ICONS[lt.code]} {lt.code}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{lt.name}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 18, fontWeight: 800, color: lt.code === 'LWP' ? 'var(--gray-500)' : 'var(--primary)' }}>
                                                        {lt.code === 'LWP' ? '∞' : (balances[lt.code] ?? 0)}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{lt.code === 'LWP' ? 'unlimited' : 'days'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
