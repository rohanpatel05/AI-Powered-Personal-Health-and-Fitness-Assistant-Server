import Joi from "joi";
import {
  planNameRegex,
  mealTypeRegex,
  foodItemRegex,
} from "../config/regex.js";
import NutritionPlan from "../models/nutrition.js";
import errorCodes from "../config/errorCodes.js";

const foodSchema = Joi.object({
  foodItem: Joi.string().pattern(foodItemRegex).required(),
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).required(),
  carbs: Joi.number().min(0).required(),
  fat: Joi.number().min(0).required(),
});

const mealSchema = Joi.object({
  mealType: Joi.string().pattern(mealTypeRegex).required(),
  foods: Joi.array().items(foodSchema).required(),
});

const nutritionPlanSchema = Joi.object({
  planName: Joi.string().pattern(planNameRegex).required(),
  goal: Joi.string().optional(),
  calories: Joi.number().min(0).required(),
  macros: Joi.object({
    protein: Joi.number().min(0).required(),
    carbs: Joi.number().min(0).required(),
    fat: Joi.number().min(0).required(),
  }).required(),
  meals: Joi.array().items(mealSchema).required(),
});

const nutritionControllers = {
  async createNutritionPlan(req, res, next) {
    const { error } = nutritionPlanSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { planName, goal, calories, macros, meals } = req.body;

    try {
      const nutritionPlan = new NutritionPlan({
        userId: req.user._id,
        planName,
        goal,
        calories,
        macros,
        meals,
      });

      await NutritionPlan.save();

      return res.status(201).json({
        message: "Nutrition plan created successfully.",
        nutritionPlan,
      });
    } catch (error) {
      next(error);
    }
  },
  async getNutritionPlans(req, res, next) {
    try {
      const nutritionPlans = await NutritionPlan.find({ userId: req.user._id });

      return res.status(200).json(nutritionPlans);
    } catch (error) {
      next(error);
    }
  },
  async getNutritionPlanById(req, res, next) {
    const { id } = req.params;

    try {
      const nutritionPlan = await NutritionPlan.findById(id);

      if (
        !nutritionPlan ||
        nutritionPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Nutrition plan not found." });
      }

      return res.status(200).json(nutritionPlan);
    } catch (error) {
      next(error);
    }
  },
  async updateNutritionPlan(req, res, next) {
    const { id } = req.params;
    const { error } = nutritionPlanSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { planName, goal, calories, macros, meals } = req.body;

    try {
      const nutritionPlan = await NutritionPlan.findById(id);
      if (
        !nutritionPlan ||
        nutritionPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Nutrition plan not found." });
      }

      nutritionPlan.planName = planName || nutritionPlan.planName;
      nutritionPlan.goal = goal || nutritionPlan.goal;
      nutritionPlan.calories = calories || nutritionPlan.calories;
      nutritionPlan.macros = macros || nutritionPlan.macros;
      nutritionPlan.meals = meals || nutritionPlan.meals;

      await nutritionPlan.save();

      return res.status(200).json({
        message: "Nutrition plan updated successfully.",
        nutritionPlan,
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteNutritionPlan(req, res, next) {
    const { id } = req.params;

    try {
      const nutritionPlan = await NutritionPlan.findById(id);
      if (
        !nutritionPlan ||
        nutritionPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Nutrition plan not found." });
      }

      await nutritionPlan.remove();

      return res
        .status(200)
        .json({ message: "Nutrition plan deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

export default nutritionControllers;
