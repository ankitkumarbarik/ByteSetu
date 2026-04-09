const Paper = require("../models/Paper");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const findOrCreateAuthor = async (name, email) => {
    let user = await User.findOne({ email });
    let password = null;
    let isNew = false;

    if (!user) {
        isNew = true;
        password =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: "author",
        });
        await user.save();
    }
    return { user, password, isNew };
};

exports.submitPaper = async (req, res) => {
    try {
        const { title, abstract, name, email } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "raw",
            folder: "research_papers",
            use_filename: true,
            access_mode: "public",
        });

        fs.unlinkSync(req.file.path);

        let authorId;
        if (req.user) {
            authorId = req.user.id;
        } else {
            if (!name || !email)
                return res
                    .status(400)
                    .json({ message: "Author details required" });

            try {
                const { user, password, isNew } = await findOrCreateAuthor(
                    name,
                    email,
                );
                authorId = user._id;

                if (isNew) {
                    try {
                        await sendEmail({
                            email,
                            subject: "Your Research Account Created",
                            message: `Welcome! Your password is provided below.`,
                            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #2563eb;">Welcome to Research Portal</h2>
                            <p>Your paper <strong>"${title}"</strong> has been successfully submitted.</p>
                            <p>An account has been created for you to track your submission status.</p>
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                                <p style="margin: 10px 0 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 1.2em; background: #fff; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
                            </div>
                            <p>Please login to change your password and view your dashboard.</p>
                            <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
                        </div>`,
                        });
                    } catch (emailError) {
                        console.error(
                            "Failed to send welcome email:",
                            emailError,
                        );
                    }
                } else {
                }
            } catch (authError) {
                console.error("Error in findOrCreateAuthor:", authError);
                return res
                    .status(500)
                    .json({ message: "Failed to create/link author account" });
            }
        }

        const newPaper = new Paper({
            title,
            abstract,
            authorId,
            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            status: "SUBMITTED",
        });

        await newPaper.save();

        res.status(201).json({
            message: "Paper submitted successfully",
            paper: newPaper,
        });
    } catch (error) {
        console.error("Submit Paper Error:", error);
        if (req.file && fs.existsSync(req.file.path))
            fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find()
            .populate("authorId", "name email")
            .populate("reviewers.reviewerId", "name email");
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssignedPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ "reviewers.reviewerId": req.user.id })
            .populate("authorId", "name")
            .populate("reviewers.reviewerId", "name");

        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.assignReviewer = async (req, res) => {
    try {
        const { paperId, reviewerId } = req.body;
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ message: "Paper not found" });

        const exists = paper.reviewers.some(
            (r) => r.reviewerId.toString() === reviewerId,
        );
        if (exists) {
            return res
                .status(400)
                .json({ message: "Reviewer already assigned" });
        }

        paper.reviewers.push({
            reviewerId,
            status: "ASSIGNED",
        });

        paper.status = "UNDER_REVIEW";
        await paper.save();

        const reviewer = await User.findById(reviewerId);
        if (reviewer) {
            await sendEmail({
                email: reviewer.email,
                subject: "New Paper Assigned",
                message: "You have a new paper to review.",
                html: "<p>New paper assigned.</p>",
            });
        }

        res.json({ message: "Reviewer assigned" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { paperId, remark, recommendation } = req.body;
        const paper = await Paper.findById(paperId);

        if (!paper) return res.status(404).json({ message: "Paper not found" });

        if (paper.status === "PUBLISHED" || paper.status === "REJECTED") {
            return res
                .status(400)
                .json({ message: "Cannot review a finalized paper" });
        }

        const reviewEntry = paper.reviewers.find(
            (r) =>
                (r.reviewerId._id &&
                    r.reviewerId._id.toString() === req.user.id) ||
                r.reviewerId.toString() === req.user.id,
        );

        if (!reviewEntry)
            return res
                .status(403)
                .json({ message: "Not assigned to this paper" });

        if (reviewEntry) {
            reviewEntry.remark = remark;
            reviewEntry.recommendation = recommendation;
            reviewEntry.status = "REVIEWED";
        }

        await paper.save();
        res.json({ message: "Review submitted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ authorId: req.user.id });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.finalDecision = async (req, res) => {
    try {
        const { paperId, decision } = req.body;
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ message: "Paper not found" });

        if (decision === "PUBLISH") {
            paper.status = "PUBLISHED";
            paper.publishedAt = new Date();
        } else if (decision === "REJECT") {
            paper.status = "REJECTED";
        } else {
            return res.status(400).json({ message: "Invalid decision" });
        }

        await paper.save();

        const author = await User.findById(paper.authorId);
        await sendEmail({
            email: author.email,
            subject: `Paper ${decision}ED`,
            message: `Your paper ${paper.title} has been ${decision}ED.`,
            html: `<p>Your paper has been ${decision}ED.</p>`,
        });

        res.json({ message: "Decision recorded" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeReviewer = async (req, res) => {
    try {
        const { paperId, reviewerId } = req.body;
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ message: "Paper not found" });

        paper.reviewers = paper.reviewers.filter(
            (r) => r.reviewerId.toString() !== reviewerId,
        );

        if (paper.reviewers.length === 0 && paper.status === "UNDER_REVIEW") {
            paper.status = "SUBMITTED";
        }

        await paper.save();
        res.json({ message: "Reviewer removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPublishedPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ status: "PUBLISHED" })
            .populate("authorId", "name")
            .select("title abstract cloudinaryUrl publishedAt authorId");
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPdfUrl = async (req, res) => {
    try {
        const { paperId } = req.params;
        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).json({ message: "Paper not found" });
        }

        const publicId = paper.cloudinaryPublicId;

        const signedUrl = cloudinary.url(publicId + ".pdf", {
            resource_type: "image",
            type: "upload",
            sign_url: true,
            secure: true,
        });

        res.json({ url: signedUrl });
    } catch (error) {
        console.error("Error generating PDF URL:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.streamPdf = async (req, res) => {
    try {
        const { paperId } = req.params;
        const paper = await Paper.findById(paperId);

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        res.redirect(paper.cloudinaryUrl);
    } catch (error) {
        console.error("Error redirecting to PDF:", error);
        res.status(500).send("Failed to load PDF: " + error.message);
    }
};

exports.getPaperById = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id)
            .populate("authorId", "name email")
            .populate("reviewers.reviewerId", "name email");

        if (!paper) {
            return res.status(404).json({ message: "Paper not found" });
        }

        if (req.user) {
            const isAdmin = req.user.role === "admin";
            const isAuthor = paper.authorId._id.toString() === req.user.id;
            const isReviewer = paper.reviewers.some(
                (r) => r.reviewerId._id.toString() === req.user.id,
            );

            if (!isAdmin && !isAuthor && !isReviewer) {
                return res
                    .status(403)
                    .json({ message: "Unauthorized to view this paper" });
            }
        }

        res.json(paper);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePaper = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);
        if (!paper) return res.status(404).json({ message: "Paper not found" });

        if (paper.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(paper.cloudinaryPublicId);
            } catch (err) {
                console.error("Failed to delete from Cloudinary:", err);
            }
        }

        await Paper.findByIdAndDelete(req.params.id);
        res.json({ message: "Paper deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
