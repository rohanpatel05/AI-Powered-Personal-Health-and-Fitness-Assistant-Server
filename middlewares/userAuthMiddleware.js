import jwt from "jsonwebtoken";
import User from "../models/user.js";
import errorCodes from "../config/errorCodes.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const userAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(errorCodes.UNAUTHORIZED)
      .json({ message: "No access token provided." });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
    if (err) {
      return res
        .status(errorCodes.FORBIDDEN)
        .json({ message: "Invalid access token." });
    }

    try {
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res
          .status(errorCodes.FORBIDDEN)
          .json({ message: "Access denied. User not found." });
      }

      req.user = user;
      next();
    } catch (error) {
      return res
        .status(errorCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error." });
    }
  });
};

export default userAuthMiddleware;
