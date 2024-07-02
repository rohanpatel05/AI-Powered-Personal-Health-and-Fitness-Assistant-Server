import express from "express";
import workoutControllers from "../controllers/workoutControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

const baseWorkoutUrl = "/workouts";

router.post(
  baseWorkoutUrl,
  userAuthMiddleware,
  workoutControllers.createWorkoutPlan
);
router.get(
  baseWorkoutUrl,
  userAuthMiddleware,
  workoutControllers.getWorkoutPlans
);
router.get(
  `${baseWorkoutUrl}/:id`,
  userAuthMiddleware,
  workoutControllers.getWorkoutPlanById
);
router.put(
  `${baseWorkoutUrl}/:id`,
  userAuthMiddleware,
  workoutControllers.updateWorkoutPlan
);
router.delete(
  `${baseWorkoutUrl}/:id`,
  userAuthMiddleware,
  workoutControllers.deleteWorkoutPlan
);

export default router;
