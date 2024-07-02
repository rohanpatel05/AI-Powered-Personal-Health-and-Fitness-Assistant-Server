import Joi from "joi";
import {
  planNameRegex,
  goalsRegex,
  dayRegex,
  exerciseNameRegex,
} from "../config/regex.js";
import Workout from "../models/workout.js";
import errorCodes from "../config/errorCodes.js";

const exerciseSchema = Joi.object({
  name: Joi.string().pattern(exerciseNameRegex).required(),
  sets: Joi.number().min(1).required(),
  reps: Joi.number().min(1).required(),
  duration: Joi.number().min(0).default(0),
  rest: Joi.number().min(0).default(0),
});

const workoutDaySchema = Joi.object({
  day: Joi.string().pattern(dayRegex).required(),
  exercises: Joi.array().items(exerciseSchema).required(),
});

const workoutPlanSchema = Joi.object({
  planName: Joi.string().pattern(planNameRegex).required(),
  goal: Joi.string().pattern(goalsRegex).optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").required(),
  workouts: Joi.array().items(workoutDaySchema).required(),
});

const workoutControllers = {
  async createWorkoutPlan(req, res, next) {
    const { error } = workoutPlanSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { planName, goal, level, workouts } = req.body;

    try {
      const workoutPlan = new Workout({
        userId: req.user._id,
        planName,
        goal,
        level,
        workouts,
      });

      await workoutPlan.save();

      return res
        .status(201)
        .json({ message: "Workout plan created successfully.", workoutPlan });
    } catch (error) {
      next(error);
    }
  },
  async getWorkoutPlans(req, res, next) {
    try {
      const workoutPlans = await Workout.find({ userId: req.user._id });

      return res.status(200).json(workoutPlans);
    } catch (error) {
      next(error);
    }
  },
  async getWorkoutPlanById(req, res, next) {
    const { id } = req.params;

    try {
      const workoutPlan = await Workout.findById(id);

      if (
        !workoutPlan ||
        workoutPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Workout plan not found." });
      }

      return res.status(200).json(workoutPlan);
    } catch (error) {
      next(error);
    }
  },
  async updateWorkoutPlan(req, res, next) {
    const { id } = req.params;
    const { error } = workoutPlanSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { planName, goal, level, workouts } = req.body;

    try {
      const workoutPlan = await Workout.findById(id);

      if (
        !workoutPlan ||
        workoutPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Workout plan not found." });
      }

      workoutPlan.planName = planName || workoutPlan.planName;
      workoutPlan.goal = goal || workoutPlan.goal;
      workoutPlan.level = level || workoutPlan.level;
      workoutPlan.workouts = workouts || workoutPlan.workouts;

      await workoutPlan.save();

      return res
        .status(200)
        .json({ message: "Workout plan updated successfully.", workoutPlan });
    } catch (error) {
      next(error);
    }
  },
  async deleteWorkoutPlan(req, res, next) {
    const { id } = req.params;

    try {
      const workoutPlan = await Workout.findById(id);
      if (
        !workoutPlan ||
        workoutPlan.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Workout plan not found." });
      }

      await workoutPlan.remove();

      return res
        .status(200)
        .json({ message: "Workout plan deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

export default workoutControllers;
