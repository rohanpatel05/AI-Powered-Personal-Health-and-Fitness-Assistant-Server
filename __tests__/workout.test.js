import request from "supertest";
import mongoose from "mongoose";
import app from "../app"; // Assuming the express app is exported from app.js
import Workout from "../models/workout";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken"; // To mock JWT for authenticated requests

let mongoServer;

describe("Workout Routes", () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Initialize in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Mock JWT token and user ID
    userId = new mongoose.Types.ObjectId().toHexString();
    token = jwt.sign({ _id: userId }, "testSecret", { expiresIn: "1h" });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Workout.deleteMany({});
  });

  describe("POST /workouts", () => {
    it("should create a workout plan", async () => {
      const newWorkout = {
        planName: "Test Plan",
        level: "beginner",
        workouts: [
          {
            day: "Monday",
            exercises: [{ name: "Squats", sets: 3, reps: 12 }],
          },
        ],
      };

      const res = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(newWorkout);

      expect(res.statusCode).toBe(201);
      expect(res.body.workoutPlan).toHaveProperty("planName", "Test Plan");
    });

    it("should return 400 if workout plan data is invalid", async () => {
      const invalidWorkout = {
        planName: "123", // Invalid planName as per regex
        level: "invalid-level", // Invalid level
        workouts: [],
      };

      const res = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidWorkout);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /workouts", () => {
    it("should get all workout plans for a user", async () => {
      const workout1 = new Workout({
        userId,
        planName: "Plan 1",
        level: "beginner",
        workouts: [],
      });
      const workout2 = new Workout({
        userId,
        planName: "Plan 2",
        level: "advanced",
        workouts: [],
      });
      await workout1.save();
      await workout2.save();

      const res = await request(app)
        .get("/workouts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty("planName", "Plan 1");
      expect(res.body[1]).toHaveProperty("planName", "Plan 2");
    });
  });

  describe("GET /workouts/:id", () => {
    it("should return a workout plan by ID", async () => {
      const workout = new Workout({
        userId,
        planName: "Single Plan",
        level: "beginner",
        workouts: [],
      });
      await workout.save();

      const res = await request(app)
        .get(`/workouts/${workout._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("planName", "Single Plan");
    });

    it("should return 404 if workout plan not found", async () => {
      const res = await request(app)
        .get(`/workouts/${mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Workout plan not found.");
    });
  });

  describe("PUT /workouts/:id", () => {
    it("should update a workout plan", async () => {
      const workout = new Workout({
        userId,
        planName: "Plan to Update",
        level: "beginner",
        workouts: [],
      });
      await workout.save();

      const updatedPlan = {
        planName: "Updated Plan",
        level: "intermediate",
        workouts: [],
      };

      const res = await request(app)
        .put(`/workouts/${workout._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedPlan);

      expect(res.statusCode).toBe(200);
      expect(res.body.workoutPlan).toHaveProperty("planName", "Updated Plan");
    });

    it("should return 400 if the updated data is invalid", async () => {
      const workout = new Workout({
        userId,
        planName: "Plan to Update",
        level: "beginner",
        workouts: [],
      });
      await workout.save();

      const invalidPlan = {
        planName: "Invalid 123", // Invalid as per regex
        level: "invalid-level",
        workouts: [],
      };

      const res = await request(app)
        .put(`/workouts/${workout._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidPlan);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("DELETE /workouts/:id", () => {
    it("should delete a workout plan", async () => {
      const workout = new Workout({
        userId,
        planName: "Plan to Delete",
        level: "beginner",
        workouts: [],
      });
      await workout.save();

      const res = await request(app)
        .delete(`/workouts/${workout._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Workout plan deleted successfully."
      );
    });

    it("should return 404 if workout plan not found", async () => {
      const res = await request(app)
        .delete(`/workouts/${mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Workout plan not found.");
    });
  });
});
