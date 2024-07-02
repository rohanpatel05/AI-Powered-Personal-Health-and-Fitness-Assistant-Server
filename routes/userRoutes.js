import express from "express";
import userControllers from "../controllers/userControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

const baseUserUrl = "/user";

router.get(
  `${baseUserUrl}/profile`,
  userAuthMiddleware,
  userControllers.getProfile
);
router.put(
  `${baseUserUrl}/profile`,
  userAuthMiddleware,
  userControllers.updateProfile
);
router.put(
  `${baseUserUrl}/change-password`,
  userAuthMiddleware,
  userControllers.changePassword
);

export default router;
