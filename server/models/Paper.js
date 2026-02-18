const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    abstract: {
        type: String,
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reviewers: [
        {
            reviewerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: {
                type: String,
                enum: ["ASSIGNED", "REVIEWED"],
                default: "ASSIGNED",
            },
            remark: {
                type: String,
                default: "",
            },
            recommendation: {
                type: String,
                enum: [
                    "ACCEPTED",
                    "REJECTED",
                    "CHANGES_REQUIRED",
                    "APPROVE",
                    "REJECT",
                    "",
                ],
                default: "",
            },
            assignedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    cloudinaryUrl: {
        type: String,
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "REJECTED"],
        default: "SUBMITTED",
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    publishedAt: {
        type: Date,
    },
});

module.exports = mongoose.model("Paper", paperSchema);
