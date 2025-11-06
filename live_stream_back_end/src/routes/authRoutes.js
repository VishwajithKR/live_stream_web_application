import express from "express";
import { register, login, profile } from "../controllers/authController.js";
import { verifyToken } from "../middleWare/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.use(verifyToken);
router.get("/profile", profile);

export default router;
