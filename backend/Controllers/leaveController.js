import Leave from "../Models/leaveModel.js";
import User from "../Models/userModel.js";

// Apply for leave (Employee only)
export const applyLeave = async (req, res) => {
    const { startDate, endDate, reason } = req.body;

    try {
        // Validate input
        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        // Calculate number of days
        const diffTime = Math.abs(end - start);
        const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const employee = await User.findById(req.user._id);
        if (employee.leaveBalance < numberOfDays) {
            return res.status(400).json({
                message: `Insufficient leave balance. You have ${employee.leaveBalance} days available, but requested ${numberOfDays} days.`,
                availableBalance: employee.leaveBalance,
                requestedDays: numberOfDays
            });
        }

        // Create leave request
        const newLeave = await Leave.create({
            employeeId: req.user._id,
            startDate,
            endDate,
            reason,
            numberOfDays
        });

        // Populate employee details
        await newLeave.populate('employeeId', 'name email');

        res.status(201).json({
            message: "Leave request submitted successfully",
            leave: newLeave
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get current user's leave requests
export const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id })
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            leaves,
            count: leaves.length
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all leave requests (Manager only)
export const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query;

        let filter = {};
        if (status) {
            filter.status = status;
        }

        const leaves = await Leave.find(filter)
            .populate('employeeId', 'name email leaveBalance')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            leaves,
            count: leaves.length
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Approve leave request (Manager only)
export const approveLeave = async (req, res) => {
    const { id } = req.params;

    try {
        const leave = await Leave.findById(id).populate('employeeId');

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Leave request is already ${leave.status}` });
        }

        // Validate leave balance again
        const employee = await User.findById(leave.employeeId._id);
        if (employee.leaveBalance < leave.numberOfDays) {
            return res.status(400).json({
                message: `Cannot approve. Employee has insufficient leave balance. Available: ${employee.leaveBalance} days, Required: ${leave.numberOfDays} days.`,
                availableBalance: employee.leaveBalance,
                requestedDays: leave.numberOfDays
            });
        }

        // Deduct leave balance
        employee.leaveBalance -= leave.numberOfDays;
        await employee.save();

        // Update leave status
        leave.status = 'approved';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        await leave.save();

        await leave.populate('reviewedBy', 'name email');

        res.status(200).json({
            message: "Leave request approved successfully",
            leave,
            updatedBalance: employee.leaveBalance
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reject leave request (Manager only)
export const rejectLeave = async (req, res) => {
    const { id } = req.params;

    try {
        const leave = await Leave.findById(id).populate('employeeId');

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Leave request is already ${leave.status}` });
        }

        // Update leave status
        leave.status = 'rejected';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        await leave.save();

        await leave.populate('reviewedBy', 'name email');

        res.status(200).json({
            message: "Leave request rejected",
            leave
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
