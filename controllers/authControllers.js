import Joi from "joi";
import errorCodes from "../config/errorCodes.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Admin from "../models/admin.js";
import "dotenv/config";
import bcrypt from "bcrypt";
import {
  activityLevelRegex,
  ageRegex,
  emailRegex,
  genderRegex,
  goalsRegex,
  heightRegex,
  nameRegex,
  passwordRegex,
  weightRegex,
} from "../config/regex.js";

const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "7d";
const accessTokenMaxAge = 15 * 60 * 1000; // 15 mins in ms
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const setTokensAsCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: accessTokenMaxAge,
    // secure: true,
    // sameSite: "None",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: refreshTokenMaxAge,
    // secure: true,
    // sameSite: "None",
  });
};

const clearTokens = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

const signupSchema = Joi.object({
  name: Joi.string().pattern(nameRegex).required(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
  age: Joi.string().pattern(ageRegex).required(),
  gender: Joi.string().pattern(genderRegex).required(),
  height: Joi.string().pattern(heightRegex).required(),
  weight: Joi.string().pattern(weightRegex).required(),
  activityLevel: Joi.string().pattern(activityLevelRegex).required(),
  goals: Joi.string().pattern(goalsRegex).required(),
});

const signinSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const authControllers = {
  async signup(req, res, next) {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      activityLevel,
      goals,
    } = req.body;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "User already exists with this email" });
      }

      const newUser = new User({
        name,
        email,
        password,
        age,
        gender,
        height,
        weight,
        activityLevel,
        goals,
      });
      await newUser.save();

      const user = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        height: newUser.height,
        weight: newUser.weight,
        activityLevel: newUser.activityLevel,
        goals: newUser.goals,
        role: newUser.role,
      };

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiresIn }
      );
      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiresIn }
      );

      setTokensAsCookies(res, accessToken, refreshToken);

      return res
        .status(201)
        .json({ message: "User created successfully", user });
    } catch (error) {
      next(error);
    }
  },
  async signin(req, res, next) {
    const { error } = signinSchema.validate(req.body);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
      let userInfo = await User.findOne({ email });
      let role = "user";

      if (!userInfo) {
        userInfo = await Admin.findOne({ email });
        role = "admin";
      }

      if (!userInfo) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, userInfo.password);

      if (!passwordMatch) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid credentials" });
      }

      let user;

      if (role === "user") {
        user = {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          age: userInfo.age,
          gender: userInfo.gender,
          height: userInfo.height,
          weight: userInfo.weight,
          activityLevel: userInfo.activityLevel,
          goals: userInfo.goals,
          role: userInfo.role,
        };
      } else {
        user = {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
        };
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiresIn }
      );
      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiresIn }
      );

      setTokensAsCookies(res, accessToken, refreshToken);

      return res.status(200).json({ message: "Logged in successfully", user });
    } catch (error) {
      next(error);
    }
  },
  async signout(req, res, next) {
    try {
      clearTokens(res);

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },
  async refresh(req, res, next) {
    const { error } = refreshSchema.validate(req.cookies);

    if (error) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    const refreshToken = req.cookies.refreshToken;

    try {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res
              .status(errorCodes.UNAUTHORIZED)
              .json({ message: "Invalid refresh token" });
          }

          const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: accessTokenExpiresIn }
          );

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            maxAge: accessTokenMaxAge,
            // secure: true,
            // sameSite: "None",
          });

          return res
            .status(200)
            .json({ message: "Access token refreshed successfully" });
        }
      );
    } catch (error) {
      next(error);
    }
  },
};

export default authControllers;
