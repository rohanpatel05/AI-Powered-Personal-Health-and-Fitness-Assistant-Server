import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import errorCodes from "../config/errorCodes.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const adminAuthMiddleware = async (req, res, next) => {
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
      const admin = await Admin.findById(decodedToken.userId);
      if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
        return res
          .status(errorCodes.FORBIDDEN)
          .json({ message: "Access denied. Admins only." });
      }

      req.user = admin;
      next();
    } catch (error) {
      return res
        .status(errorCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error." });
    }
  });
};

export default adminAuthMiddleware;
