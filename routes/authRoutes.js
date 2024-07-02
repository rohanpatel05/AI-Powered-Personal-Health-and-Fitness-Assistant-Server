import express from "express";
import authControllers from "../controllers/authControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(`/signup`, authControllers.signup);
router.post(`/signin`, authControllers.signin);
router.post(`/signout`, authMiddleware, authControllers.signout);
router.post(`/refresh-token`, authControllers.refresh);

export default router;
