import Joi from "joi";
import bcrypt from "bcryptjs";
import errorCodes from "../config/errorCodes.js";
import User from "../models/user.js";
import {
  activityLevelRegex,
  ageRegex,
  genderRegex,
  goalsRegex,
  heightRegex,
  nameRegex,
  passwordRegex,
  weightRegex,
} from "../config/regex.js";

const updateProfileSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required(),
  age: Joi.string().pattern(ageRegex).required(),
  gender: Joi.string().pattern(genderRegex).required(),
  height: Joi.string().pattern(heightRegex).required(),
  weight: Joi.string().pattern(weightRegex).required(),
  activityLevel: Joi.string().pattern(activityLevelRegex).required(),
  goals: Joi.string().pattern(goalsRegex).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().pattern(passwordRegex).required(),
  newPassword: Joi.string().pattern(passwordRegex).required(),
});

const userControllers = {
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select("-password");

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async updateProfile(req, res, next) {
    const { error } = updateProfileSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { name, age, gender, height, weight, activityLevel, goals } =
      req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, age, gender, height, weight, activityLevel, goals },
        { new: true }
      ).select("-password");

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    const { error } = changePasswordSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return res.status(errorCodes.BAD_REQUEST).json({
        message: "New password cannot be the same as current password",
      });
    }

    try {
      const user = await User.findById(req.user._id);

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatch) {
        return res
          .status(errorCodes.UNAUTHORIZED)
          .json({ message: "Incorrect current password" });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default userControllers;
