import request from "supertest";
import app from "../app"; // assuming your app is exported from an "app.js" file
import mongoose from "mongoose";
import HealthMetrics from "../models/healthMetrics";
import userAuthMiddleware from "../middlewares/userAuthMiddleware";
import { mockRequest, mockResponse, mockNext } from "jest-mock-extended";

// Mock userAuthMiddleware to simulate authenticated user
jest.mock("../middlewares/userAuthMiddleware", () =>
  jest.fn((req, res, next) => {
    req.user = { _id: mongoose.Types.ObjectId() }; // mocking a user ID
    next();
  })
);

describe("Health Metrics Routes", () => {
  // Before each test, reset all mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /health-metrics
  describe("POST /health-metrics", () => {
    it("should log health metrics and return 201 status", async () => {
      const healthMetricsData = {
        weight: 70,
        height: 170,
        activityLevel: "moderate",
        dailySteps: 10000,
        sleepHours: 7,
        waterIntake: 2,
        foodLog: [{ mealType: "lunch", foodItem: "rice", calories: 500 }],
        workoutLog: [{ workoutType: "run", duration: 30, intensity: "medium" }],
      };

      jest.spyOn(HealthMetrics.prototype, "save").mockResolvedValue({
        _id: mongoose.Types.ObjectId(),
        ...healthMetricsData,
      });

      const response = await request(app)
        .post("/health-metrics")
        .send(healthMetricsData)
        .expect(201);

      expect(response.body.message).toBe("Health metrics logged successfully.");
      expect(response.body.healthMetrics.weight).toBe(70);
    });

    it("should return 400 status if validation fails", async () => {
      const invalidData = { height: -100 }; // Invalid height

      const response = await request(app)
        .post("/health-metrics")
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain(
        "fails to match the required pattern"
      );
    });
  });

  // GET /health-metrics
  describe("GET /health-metrics", () => {
    it("should retrieve all health metrics for the user", async () => {
      const metrics = [
        {
          weight: 70,
          height: 170,
          activityLevel: "moderate",
          userId: mongoose.Types.ObjectId(),
        },
        {
          weight: 75,
          height: 175,
          activityLevel: "active",
          userId: mongoose.Types.ObjectId(),
        },
      ];

      jest.spyOn(HealthMetrics, "find").mockResolvedValue(metrics);

      const response = await request(app).get("/health-metrics").expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body[0].weight).toBe(70);
    });
  });

  // GET /health-metrics/:id
  describe("GET /health-metrics/:id", () => {
    it("should retrieve health metrics by ID", async () => {
      const id = mongoose.Types.ObjectId();
      const metrics = {
        _id: id,
        weight: 70,
        userId: mongoose.Types.ObjectId(),
      };

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(metrics);

      const response = await request(app)
        .get(`/health-metrics/${id}`)
        .expect(200);

      expect(response.body.weight).toBe(70);
    });

    it("should return 404 if health metrics are not found", async () => {
      const id = mongoose.Types.ObjectId();

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(null);

      const response = await request(app)
        .get(`/health-metrics/${id}`)
        .expect(404);

      expect(response.body.message).toBe("Health metrics not found.");
    });
  });

  // PUT /health-metrics/:id
  describe("PUT /health-metrics/:id", () => {
    it("should update health metrics and return 200 status", async () => {
      const id = mongoose.Types.ObjectId();
      const updateData = { weight: 75 };
      const existingMetrics = { _id: id, weight: 70, save: jest.fn() };

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(existingMetrics);

      const response = await request(app)
        .put(`/health-metrics/${id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe(
        "Health metrics updated successfully."
      );
      expect(existingMetrics.save).toHaveBeenCalled();
      expect(existingMetrics.weight).toBe(75);
    });

    it("should return 404 if health metrics are not found", async () => {
      const id = mongoose.Types.ObjectId();
      const updateData = { weight: 75 };

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(null);

      const response = await request(app)
        .put(`/health-metrics/${id}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe("Health metrics not found.");
    });
  });

  // DELETE /health-metrics/:id
  describe("DELETE /health-metrics/:id", () => {
    it("should delete health metrics and return 200 status", async () => {
      const id = mongoose.Types.ObjectId();
      const metrics = {
        _id: id,
        userId: mongoose.Types.ObjectId(),
        remove: jest.fn(),
      };

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(metrics);

      const response = await request(app)
        .delete(`/health-metrics/${id}`)
        .expect(200);

      expect(response.body.message).toBe(
        "Health metrics deleted successfully."
      );
      expect(metrics.remove).toHaveBeenCalled();
    });

    it("should return 404 if health metrics are not found", async () => {
      const id = mongoose.Types.ObjectId();

      jest.spyOn(HealthMetrics, "findById").mockResolvedValue(null);

      const response = await request(app)
        .delete(`/health-metrics/${id}`)
        .expect(404);

      expect(response.body.message).toBe("Health metrics not found.");
    });
  });
});
