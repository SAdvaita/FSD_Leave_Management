import User from "../Models/userModel.js";

// Get current user's leave balance
export const getMyBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('name email leaveBalance');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            balance: {
                name: user.name,
                email: user.email,
                leaveBalance: user.leaveBalance
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all employees' leave balances (Manager only)
export const getAllBalances = async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' })
            .select('name email leaveBalance createdAt')
            .sort({ name: 1 });

        res.status(200).json({
            employees,
            count: employees.length
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
