import Attendance from "../Models/Attendance.js";

export const clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existingAttendance = await Attendance.findOne({
            employeeId: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "You have already clocked in today." });
        }

        const newAttendance = new Attendance({
            employeeId: userId,
            date: today,
            clockIn: new Date(),
            status: 'present'
        });

        await newAttendance.save();

        res.status(201).json({
            message: "Clocked in successfully!",
            attendance: newAttendance
        });

    } catch (error) {
        console.error("Clock In Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const clockOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!attendance) {
            return res.status(400).json({ message: "You have not clocked in today." });
        }

        if (attendance.clockOut) {
            return res.status(400).json({ message: "You have already clocked out today." });
        }

        attendance.clockOut = new Date();

        // Calculate total hours
        const diff = attendance.clockOut - attendance.clockIn;
        const hours = diff / (1000 * 60 * 60);
        attendance.totalHours = parseFloat(hours.toFixed(2));

        await attendance.save();

        res.status(200).json({
            message: "Clocked out successfully!",
            attendance
        });

    } catch (error) {
        console.error("Clock Out Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        res.status(200).json({
            clockedIn: !!attendance,
            clockedOut: !!(attendance && attendance.clockOut),
            attendance
        });

    } catch (error) {
        console.error("Get Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get attendance history for current user
export const getMyHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await Attendance.find({ employeeId: userId })
            .sort({ date: -1 })
            .limit(30);

        res.status(200).json({ history });
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all employees attendance (for manager)
export const getAllAttendance = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('employeeId', 'name email');

        res.status(200).json({ attendance });
    } catch (error) {
        console.error("Get All Attendance Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
