import express from "express";
import nutritionControllers from "../controllers/nutritionControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

const baseNutritionPlanUrl = "/nutrition-plans";

router.post(
  baseNutritionPlanUrl,
  userAuthMiddleware,
  nutritionControllers.createNutritionPlan
);
router.get(
  baseNutritionPlanUrl,
  userAuthMiddleware,
  nutritionControllers.getNutritionPlans
);
router.get(
  `${baseNutritionPlanUrl}/:id`,
  userAuthMiddleware,
  nutritionControllers.getNutritionPlanById
);
router.put(
  `${baseNutritionPlanUrl}/:id`,
  userAuthMiddleware,
  nutritionControllers.updateNutritionPlan
);
router.delete(
  `${baseNutritionPlanUrl}/:id`,
  userAuthMiddleware,
  nutritionControllers.deleteNutritionPlan
);

export default router;
