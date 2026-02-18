const express = require("express");
const router = express.Router();
const paperController = require("../controllers/paper.controller");
const { verifyToken, verifyRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public/Author: Submit Paper
// Note: verifyToken is optional if user not logged in (will create account).
// But middleware usually blocks. We need a way to allow optional auth or handle it in controller.
// Better: 2 endpoints? Or one that handles both.
// Requirement: "Author submits... Can submit without pre-existing account".
// So this route should be PUBLIC or handle optional token.
// Creating a wrapper for optional token?
// Or just check header in controller if 'verifyToken' is not on route.
// But controller logic used 'req.user'.
// I'll make a custom middleware/logic or just remove verifyToken for submission and handle manual verification if header exists.

// Middleware to populate req.user if token exists but NOT error if not
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        const jwt = require("jsonwebtoken");
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
        } catch (e) {
            // Ignore invalid token for optional auth, or warn.
        }
    }
    next();
};

// Public/Author routes
router.get("/published", paperController.getPublishedPapers);
router.get("/pdf/:paperId", paperController.getPdfUrl); // Get signed PDF URL
router.get("/stream/:paperId", paperController.streamPdf); // Stream PDF through server
router.post(
    "/submit",
    optionalAuth,
    upload.single("file"),
    paperController.submitPaper,
);
router.get(
    "/my-papers",
    verifyToken,
    verifyRole(["author"]),
    paperController.getMyPapers,
);

// Admin Routes
router.get(
    "/all",
    verifyToken,
    verifyRole(["admin"]),
    paperController.getAllPapers,
);
router.post(
    "/assign",
    verifyToken,
    verifyRole(["admin"]),
    paperController.assignReviewer,
);
router.post(
    "/remove-reviewer",
    verifyToken,
    verifyRole(["admin"]),
    paperController.removeReviewer,
);
router.post(
    "/decision",
    verifyToken,
    verifyRole(["admin"]),
    paperController.finalDecision,
);

// Reviewer Routes
router.get(
    "/assigned",
    verifyToken,
    verifyRole(["reviewer"]),
    paperController.getAssignedPapers,
);
router.post(
    "/review",
    verifyToken,
    verifyRole(["reviewer"]),
    paperController.submitReview,
);

// Common Authenticated Routes (must be logged in)
router.delete(
    "/:id",
    verifyToken,
    verifyRole(["admin"]),
    paperController.deletePaper,
);
router.get("/:id", verifyToken, paperController.getPaperById);

module.exports = router;
