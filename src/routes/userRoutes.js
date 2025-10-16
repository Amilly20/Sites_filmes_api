import { Router } from "express";
import UserController from "../controllers/userController.js";
import authentication from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/register", UserController.register);

// RF22 - Cancelar assinatura (requer autenticação)
router.post("/cancel-subscription", authentication, UserController.cancelSubscription);

export default router;
