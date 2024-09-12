import request from "supertest";
import express from "express";
import userRoutes from "../routes/userRoutes.js"; // Import your route file
import userControllers from "../controllers/userControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import User from "../models/user.js"; // Import the User model

// Mock the User model
jest.mock("../models/user.js");

// Mock the userAuthMiddleware
jest.mock("../middlewares/userAuthMiddleware.js", () =>
  jest.fn((req, res, next) => {
    req.user = { _id: "mockUserId" }; // Mock a user ID
    next();
  })
);

const app = express();
app.use(express.json()); // Middleware for parsing JSON
app.use(userRoutes); // Add the user routes to the app

describe("User Routes", () => {
  // Mock data for user profile
  const mockUserProfile = {
    _id: "mockUserId",
    name: "John Doe",
    age: 25,
    gender: "male",
    height: 175,
    weight: 70,
    activityLevel: "moderate",
    goals: "fitness",
  };

  // Test the GET /user/profile route
  describe("GET /user/profile", () => {
    it("should return user profile when authenticated", async () => {
      // Mock the User.findById function to return mockUserProfile
      User.findById.mockResolvedValue(mockUserProfile);

      const response = await request(app).get("/user/profile");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          name: "John Doe",
          age: 25,
        })
      );
    });

    it("should return 500 if an error occurs", async () => {
      // Mock the User.findById function to throw an error
      User.findById.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/user/profile");

      expect(response.status).toBe(500);
    });
  });

  // Test the PUT /user/profile route
  describe("PUT /user/profile", () => {
    const validProfileUpdate = {
      name: "Jane Doe",
      age: "28",
      gender: "female",
      height: "165",
      weight: "55",
      activityLevel: "active",
      goals: "weight loss",
    };

    it("should update and return the updated profile", async () => {
      // Mock the User.findByIdAndUpdate to return the updated profile
      User.findByIdAndUpdate.mockResolvedValue({
        ...mockUserProfile,
        ...validProfileUpdate,
      });

      const response = await request(app)
        .put("/user/profile")
        .send(validProfileUpdate);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Jane Doe");
    });

    it("should return 400 if profile data is invalid", async () => {
      const invalidProfileUpdate = {
        ...validProfileUpdate,
        age: "invalid-age", // Invalid age format
      };

      const response = await request(app)
        .put("/user/profile")
        .send(invalidProfileUpdate);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("should return 500 if an error occurs during profile update", async () => {
      // Mock the User.findByIdAndUpdate to throw an error
      User.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/user/profile")
        .send(validProfileUpdate);

      expect(response.status).toBe(500);
    });
  });

  // Test the PUT /user/change-password route
  describe("PUT /user/change-password", () => {
    const validPasswordUpdate = {
      currentPassword: "oldPassword123",
      newPassword: "newPassword123",
    };

    it("should change the password successfully", async () => {
      // Mock User.findById and bcrypt.compare
      User.findById.mockResolvedValue({
        ...mockUserProfile,
        password: "hashedOldPassword", // Assume this is the hashed current password
      });
      const bcrypt = require("bcryptjs");
      bcrypt.compare = jest.fn().mockResolvedValue(true); // Password match
      bcrypt.hash = jest.fn().mockResolvedValue("hashedNewPassword"); // New hashed password

      const response = await request(app)
        .put("/user/change-password")
        .send(validPasswordUpdate);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password changed successfully");
    });

    it("should return 400 if current and new passwords are the same", async () => {
      const samePasswordUpdate = {
        currentPassword: "samePassword123",
        newPassword: "samePassword123",
      };

      const response = await request(app)
        .put("/user/change-password")
        .send(samePasswordUpdate);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "New password cannot be the same as current password"
      );
    });

    it("should return 401 if current password is incorrect", async () => {
      User.findById.mockResolvedValue({
        ...mockUserProfile,
        password: "hashedOldPassword",
      });
      const bcrypt = require("bcryptjs");
      bcrypt.compare = jest.fn().mockResolvedValue(false); // Incorrect current password

      const response = await request(app)
        .put("/user/change-password")
        .send(validPasswordUpdate);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Incorrect current password");
    });
  });
});
