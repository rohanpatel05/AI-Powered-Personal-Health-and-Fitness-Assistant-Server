import express from "express";
import healthMetricsControllers from "../controllers/healthMetricsControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

const baseHealthMetricsUrl = "/health-metrics";

router.post(
  baseHealthMetricsUrl,
  userAuthMiddleware,
  healthMetricsControllers.logHealthMetrics
);
router.get(
  baseHealthMetricsUrl,
  userAuthMiddleware,
  healthMetricsControllers.getHealthMetrics
);
router.get(
  `${baseHealthMetricsUrl}/:id`,
  userAuthMiddleware,
  healthMetricsControllers.getHealthMetricsById
);
router.put(
  `${baseHealthMetricsUrl}/:id`,
  userAuthMiddleware,
  healthMetricsControllers.updateHealthMetrics
);
router.delete(
  `${baseHealthMetricsUrl}/:id`,
  userAuthMiddleware,
  healthMetricsControllers.deleteHealthMetrics
);

export default router;
