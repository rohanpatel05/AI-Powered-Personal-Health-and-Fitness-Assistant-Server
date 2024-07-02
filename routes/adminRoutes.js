import express from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import adminControllers from "../controllers/adminControllers.js";

const router = express.Router();

const baseAdminUrl = "/admin";

router.get(
  `${baseAdminUrl}/users`,
  adminAuthMiddleware,
  adminControllers.getAllUsers
);
router.get(
  `${baseAdminUrl}/users/:id`,
  adminAuthMiddleware,
  adminControllers.getUserById
);
router.put(
  `${baseAdminUrl}/users/:id`,
  adminAuthMiddleware,
  adminControllers.updateUserByAdmin
);
router.delete(
  `${baseAdminUrl}/users/:id`,
  adminAuthMiddleware,
  adminControllers.deleteUser
);
router.post(
  `${baseAdminUrl}/admins`,
  adminAuthMiddleware,
  adminControllers.createAdmin
);
router.get(
  `${baseAdminUrl}/admins`,
  adminAuthMiddleware,
  adminControllers.getAllAdmins
);
router.get(
  `${baseAdminUrl}/admins/:id`,
  adminAuthMiddleware,
  adminControllers.getAdminById
);
router.put(
  `${baseAdminUrl}/admins/:id`,
  adminAuthMiddleware,
  adminControllers.updateAdminById
);
router.delete(
  `${baseAdminUrl}/admins/:id`,
  adminAuthMiddleware,
  adminControllers.deleteAdmin
);

export default router;
