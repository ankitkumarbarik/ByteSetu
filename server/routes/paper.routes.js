const express = require("express");
const router = express.Router();
const paperController = require("../controllers/paper.controller");
const { verifyToken, verifyRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        const jwt = require("jsonwebtoken");
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
        } catch (e) {
        }
    }
    next();
};

router.get("/published", paperController.getPublishedPapers);
router.get("/pdf/:paperId", paperController.getPdfUrl);
router.get("/stream/:paperId", paperController.streamPdf);
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

router.delete(
    "/:id",
    verifyToken,
    verifyRole(["admin"]),
    paperController.deletePaper,
);

router.get("/:id", verifyToken, paperController.getPaperById);

module.exports = router;
