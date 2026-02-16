import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    clockIn: {
        type: Date
    },
    clockOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'half-day'],
        default: 'present'
    },
    location: {
        type: String,
        default: 'Office'
    },
    totalHours: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Prevent duplicate attendance for same day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
