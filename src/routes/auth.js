import express from "express";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

// Registro
router.post("/register", validate(registerSchema), register);

// Login
router.post("/login", validate(loginSchema), login);

export default router;
