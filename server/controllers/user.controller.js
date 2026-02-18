const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

exports.getPendingReviewers = async (req, res) => {
    try {
        const reviewers = await User.find({
            role: "reviewer",
            reviewerStatus: "PENDING",
        });
        res.json(reviewers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReviewers = async (req, res) => {
    try {
        const reviewers = await User.find({
            role: "reviewer",
            reviewerStatus: "APPROVED",
        });
        res.json(reviewers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleReviewerStatus = async (req, res) => {
    try {
        const { userId, status } = req.body; // APPROVED or REJECTED
        const user = await User.findById(userId);
        if (!user || user.role !== "reviewer") {
            return res.status(404).json({ message: "Reviewer not found" });
        }

        user.reviewerStatus = status;
        await user.save();

        // Email notification
        await sendEmail({
            email: user.email,
            subject: `Reviewer Application ${status}`,
            message: `Your application has been ${status}.`,
            html: `<p>Your application has been <strong>${status}</strong>.</p>`,
        });

        res.json({ message: `Reviewer ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
