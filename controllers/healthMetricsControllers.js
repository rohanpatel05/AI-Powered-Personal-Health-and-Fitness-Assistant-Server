import Joi from "joi";
import {
  weightRegex,
  heightRegex,
  activityLevelRegex,
  dailyStepsRegex,
  sleepHoursRegex,
  waterIntakeRegex,
  mealTypeRegex,
  foodItemRegex,
  workoutTypeRegex,
} from "../config/regex.js";
import HealthMetrics from "../models/healthMetrics.js";
import errorCodes from "../config/errorCodes.js";

const foodLogSchema = Joi.object({
  mealType: Joi.string().pattern(mealTypeRegex).required(),
  foodItem: Joi.string().pattern(foodItemRegex).required(),
  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  carbs: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
});

const workoutLogSchema = Joi.object({
  workoutType: Joi.string().pattern(workoutTypeRegex).required(),
  duration: Joi.number().min(0).required(),
  intensity: Joi.string().valid("low", "medium", "high").required(),
});

const healthMetricsSchema = Joi.object({
  date: Joi.date().optional(),
  weight: Joi.number().min(0).optional(),
  height: Joi.number().min(0).optional(),
  activityLevel: Joi.string().pattern(activityLevelRegex).optional(),
  dailySteps: Joi.number().min(0).optional(),
  sleepHours: Joi.number().min(0).optional(),
  waterIntake: Joi.number().min(0).optional(),
  foodLog: Joi.array().items(foodLogSchema).optional(),
  workoutLog: Joi.array().items(workoutLogSchema).optional(),
});

const healthMetricsControllers = {
  async logHealthMetrics(req, res, next) {
    const { error } = healthMetricsSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      date,
      weight,
      height,
      activityLevel,
      dailySteps,
      sleepHours,
      waterIntake,
      foodLog,
      workoutLog,
    } = req.body;

    try {
      const healthMetrics = new HealthMetrics({
        userId: req.user._id,
        date,
        weight,
        height,
        activityLevel,
        dailySteps,
        sleepHours,
        waterIntake,
        foodLog,
        workoutLog,
      });

      await healthMetrics.save();

      return res.status(201).json({
        message: "Health metrics logged successfully.",
        healthMetrics,
      });
    } catch (error) {
      next(error);
    }
  },
  async getHealthMetrics(req, res, next) {
    try {
      const healthMetrics = await HealthMetrics.find({ userId: req.user._id });

      return res.status(200).json(healthMetrics);
    } catch (error) {
      next(error);
    }
  },
  async getHealthMetricsById(req, res, next) {
    const { id } = req.params;

    try {
      const healthMetrics = await HealthMetrics.findById(id);

      if (
        !healthMetrics ||
        healthMetrics.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Health metrics not found." });
      }

      return res.status(200).json(healthMetrics);
    } catch (error) {
      next(error);
    }
  },
  async updateHealthMetrics(req, res, next) {
    const { id } = req.params;
    const { error } = healthMetricsSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      date,
      weight,
      height,
      activityLevel,
      dailySteps,
      sleepHours,
      waterIntake,
      foodLog,
      workoutLog,
    } = req.body;

    try {
      const healthMetrics = await HealthMetrics.findById(id);

      if (
        !healthMetrics ||
        healthMetrics.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Health metrics not found." });
      }

      healthMetrics.date = date || healthMetrics.date;
      healthMetrics.weight = weight || healthMetrics.weight;
      healthMetrics.height = height || healthMetrics.height;
      healthMetrics.activityLevel =
        activityLevel || healthMetrics.activityLevel;
      healthMetrics.dailySteps = dailySteps || healthMetrics.dailySteps;
      healthMetrics.sleepHours = sleepHours || healthMetrics.sleepHours;
      healthMetrics.waterIntake = waterIntake || healthMetrics.waterIntake;
      healthMetrics.foodLog = foodLog || healthMetrics.foodLog;
      healthMetrics.workoutLog = workoutLog || healthMetrics.workoutLog;

      await healthMetrics.save();

      return res.status(200).json({
        message: "Health metrics updated successfully.",
        healthMetrics,
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteHealthMetrics(req, res, next) {
    const { id } = req.params;

    try {
      const healthMetrics = await HealthMetrics.findById(id);

      if (
        !healthMetrics ||
        healthMetrics.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Health metrics not found." });
      }

      await healthMetrics.remove();

      return res
        .status(200)
        .json({ message: "Health metrics deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

export default healthMetricsControllers;
