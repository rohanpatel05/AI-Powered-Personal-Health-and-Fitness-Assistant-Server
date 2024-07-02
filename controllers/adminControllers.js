import Joi from "joi";
import User from "../models/user.js";
import Admin from "../models/admin.js";
import errorCodes from "../config/errorCodes.js";
import {
  activityLevelRegex,
  ageRegex,
  emailRegex,
  genderRegex,
  goalsRegex,
  heightRegex,
  nameRegex,
  passwordRegex,
  roleRegex,
  weightRegex,
} from "../config/regex.js";

const userUpdateSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required(),
  age: Joi.string().pattern(ageRegex).required(),
  gender: Joi.string().pattern(genderRegex).required(),
  height: Joi.string().pattern(heightRegex).required(),
  weight: Joi.string().pattern(weightRegex).required(),
  activityLevel: Joi.string().pattern(activityLevelRegex).required(),
  goals: Joi.string().pattern(goalsRegex).required(),
});

const adminCreateSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
  role: Joi.string().pattern(roleRegex).required(),
});

const adminUpdateSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required(),
  email: Joi.string().pattern(emailRegex).required(),
  role: Joi.string().pattern(roleRegex).required(),
});

const adminControllers = {
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().select("-password");

      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
  async getUserById(req, res, next) {
    const { id } = req.params;

    try {
      const user = await User.findById(id).select("-password");

      if (!user) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "User not found." });
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async updateUserByAdmin(req, res, next) {
    const { id } = req.params;
    const { error } = userUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { name, age, gender, height, weight, activityLevel, goals } =
      req.body;

    try {
      const user = await User.findByIdAndUpdate(
        id,
        { name, age, gender, height, weight, activityLevel, goals },
        { new: true }
      ).select("-password");

      if (!user) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "User not found." });
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async deleteUser(req, res, next) {
    const { id } = req.params;

    try {
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "User not found." });
      }

      return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
  async createAdmin(req, res, next) {
    const { error } = adminCreateSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { name, email, password, role } = req.body;

    try {
      const existingAdmin = await Admin.findOne({ email });

      if (existingAdmin) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Admin already exists." });
      }

      const newAdmin = new Admin({ name, email, password, role });
      await newAdmin.save();

      return res.status(201).json({ message: "Admin created successfully." });
    } catch (error) {
      next(error);
    }
  },
  async getAllAdmins(req, res, next) {
    try {
      const admins = await Admin.find().select("-password");

      return res.status(200).json(admins);
    } catch (error) {
      next(error);
    }
  },
  async getAdminById(req, res, next) {
    const { id } = req.params;

    try {
      const admin = await Admin.findById(id).select("-password");

      if (!admin) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Admin not found." });
      }

      return res.status(200).json(admin);
    } catch (error) {
      next(error);
    }
  },
  async updateAdminById(req, res, next) {
    const { id } = req.params;
    const { error } = adminUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { name, email, role } = req.body;

    try {
      const admin = await Admin.findByIdAndUpdate(
        id,
        { name, email, role },
        { new: true }
      ).select("-password");

      if (!admin) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Admin not found." });
      }

      return res.status(200).json(admin);
    } catch (error) {
      next(error);
    }
  },
  async deleteAdmin(req, res, next) {
    const { id } = req.params;

    try {
      const deletedAdmin = await Admin.findByIdAndDelete(id);

      if (!deletedAdmin) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Admin not found." });
      }

      return res.status(200).json({ message: "Admin deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

export default adminControllers;
