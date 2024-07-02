import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Admin from "../models/admin.js";
import errorCodes from "../config/errorCodes.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const authMiddleware = async (req, res, next) => {
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
      let user;
      let role = "user";

      if (
        decodedToken.role &&
        (decodedToken.role === "admin" || decodedToken.role === "superadmin")
      ) {
        user = await Admin.findById(decodedToken.userId);
        role = decodedToken.role;
      } else {
        user = await User.findById(decodedToken.userId);
      }

      if (!user) {
        return res
          .status(errorCodes.FORBIDDEN)
          .json({ message: "Access denied. User/Admin not found." });
      }

      req.user = user;
      req.user.role = role;
      next();
    } catch (error) {
      return res
        .status(errorCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error." });
    }
  });
};

export default authMiddleware;
