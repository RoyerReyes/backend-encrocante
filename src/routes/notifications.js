import express from "express";
import { sendBroadcast } from "../controllers/notificationsController.js";
// import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js"; 
// TODO: Uncomment auth when ready, for now open for testing or integrate immediately if possible.
// Integrating auth immediately as per best practices.
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /notifications/broadcast
// Protected: Only logged in users (or admin specific if we add authorizeRole)
router.post("/broadcast", authMiddleware, sendBroadcast);

export default router;
