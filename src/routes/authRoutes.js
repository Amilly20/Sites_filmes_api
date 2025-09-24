import { Router } from "express";
import Autenticacao from "../controllers/authController.js";

const router = Router();

router.post("/login", Autenticacao.login);
router.post("/forgot-password", Autenticacao.forgotPassword);
router.post("/reset-password", Autenticacao.resetPassword);

export default router;
