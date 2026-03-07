import { Router } from "express";
import { getAppConfig, uploadQrImage } from "../controllers/configController.js";
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get("/", getAppConfig);
router.post("/upload-qr", upload.single('imagen'), uploadQrImage);

export default router;
