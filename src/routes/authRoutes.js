import { Router } from "express";
import Autenticacao from "../controllers/authController.js";

const router = Router();

router.post("/login", Autenticacao.login);

export default router;
