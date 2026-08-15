const Doctor = require('../models/Doctor-model');

const checkSubscription = async (req, res, next) => {
    try {
        const doctorId = req.user?._id;

        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const doctor = await Doctor.findOne({ userId: doctorId });

        // If subscription is active or not explicitly enforced, continue
        if (doctor && (doctor.isSubscribed || doctor.subscriptionStatus === 'active')) {
            return next();
        }

        return res.status(403).json({ 
            message: "Active subscription required. Please purchase a subscription plan." 
        });
    } catch (error) {
        console.error("Subscription middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = checkSubscription;