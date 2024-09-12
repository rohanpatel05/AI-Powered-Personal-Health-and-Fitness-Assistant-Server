import request from "supertest";
import express from "express";
import mockingoose from "mockingoose";
import mongoose from "mongoose";
import nutritionRoutes from "../routes/nutritionRoutes"; // Import your routes
import NutritionPlan from "../models/nutrition"; // Import your model
import User from "../models/user"; // Import user model if needed for auth

const app = express();
app.use(express.json());
app.use("/", nutritionRoutes);

// Mock middleware (userAuthMiddleware)
jest.mock("../middlewares/userAuthMiddleware.js", () => (req, res, next) => {
  req.user = { _id: "507f191e810c19729de860ea" }; // Mocked user ID
  next();
});

describe("Nutrition Routes", () => {
  beforeEach(() => {
    mockingoose.resetAll(); // Reset the mock for every test
  });

  describe("POST /nutrition-plans", () => {
    it("should create a new nutrition plan", async () => {
      const nutritionPlanData = {
        planName: "My Nutrition Plan",
        goal: "Muscle Gain",
        calories: 2500,
        macros: { protein: 150, carbs: 300, fat: 80 },
        meals: [
          {
            mealType: "breakfast",
            foods: [
              {
                foodItem: "Oats",
                calories: 200,
                protein: 10,
                carbs: 30,
                fat: 5,
              },
            ],
          },
        ],
      };

      mockingoose(NutritionPlan).toReturn(nutritionPlanData, "save");

      const res = await request(app)
        .post("/nutrition-plans")
        .send(nutritionPlanData)
        .expect(201);

      expect(res.body.message).toBe("Nutrition plan created successfully.");
      expect(res.body.nutritionPlan.planName).toBe(nutritionPlanData.planName);
    });

    it("should return validation error for invalid data", async () => {
      const invalidData = {
        planName: "Plan with Missing Data",
        // Missing required fields: calories, macros, meals
      };

      const res = await request(app)
        .post("/nutrition-plans")
        .send(invalidData)
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  describe("GET /nutrition-plans", () => {
    it("should return all nutrition plans for the user", async () => {
      const nutritionPlans = [
        {
          planName: "Plan 1",
          calories: 2000,
          macros: { protein: 120, carbs: 200, fat: 60 },
          meals: [],
        },
        {
          planName: "Plan 2",
          calories: 2500,
          macros: { protein: 150, carbs: 250, fat: 80 },
          meals: [],
        },
      ];

      mockingoose(NutritionPlan).toReturn(nutritionPlans, "find");

      const res = await request(app).get("/nutrition-plans").expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0].planName).toBe("Plan 1");
      expect(res.body[1].planName).toBe("Plan 2");
    });
  });

  describe("GET /nutrition-plans/:id", () => {
    it("should return a nutrition plan by id", async () => {
      const nutritionPlan = {
        _id: mongoose.Types.ObjectId("507f191e810c19729de860ea"),
        planName: "My Nutrition Plan",
        calories: 2500,
        macros: { protein: 150, carbs: 300, fat: 80 },
        meals: [],
      };

      mockingoose(NutritionPlan).toReturn(nutritionPlan, "findOne");

      const res = await request(app)
        .get(`/nutrition-plans/${nutritionPlan._id}`)
        .expect(200);

      expect(res.body.planName).toBe(nutritionPlan.planName);
    });

    it("should return 404 if nutrition plan is not found", async () => {
      mockingoose(NutritionPlan).toReturn(null, "findOne");

      const res = await request(app)
        .get(`/nutrition-plans/507f191e810c19729de860ea`)
        .expect(404);

      expect(res.body.message).toBe("Nutrition plan not found.");
    });
  });

  describe("PUT /nutrition-plans/:id", () => {
    it("should update a nutrition plan", async () => {
      const nutritionPlan = {
        _id: mongoose.Types.ObjectId("507f191e810c19729de860ea"),
        planName: "Updated Nutrition Plan",
        calories: 2600,
        macros: { protein: 160, carbs: 310, fat: 85 },
        meals: [],
      };

      mockingoose(NutritionPlan).toReturn(nutritionPlan, "findOneAndUpdate");

      const res = await request(app)
        .put(`/nutrition-plans/${nutritionPlan._id}`)
        .send(nutritionPlan)
        .expect(200);

      expect(res.body.message).toBe("Nutrition plan updated successfully.");
      expect(res.body.nutritionPlan.calories).toBe(2600);
    });
  });

  describe("DELETE /nutrition-plans/:id", () => {
    it("should delete a nutrition plan", async () => {
      const nutritionPlan = {
        _id: mongoose.Types.ObjectId("507f191e810c19729de860ea"),
        planName: "My Nutrition Plan",
      };

      mockingoose(NutritionPlan).toReturn(nutritionPlan, "findOneAndDelete");

      const res = await request(app)
        .delete(`/nutrition-plans/${nutritionPlan._id}`)
        .expect(200);

      expect(res.body.message).toBe("Nutrition plan deleted successfully.");
    });

    it("should return 404 if nutrition plan is not found", async () => {
      mockingoose(NutritionPlan).toReturn(null, "findOneAndDelete");

      const res = await request(app)
        .delete(`/nutrition-plans/507f191e810c19729de860ea`)
        .expect(404);

      expect(res.body.message).toBe("Nutrition plan not found.");
    });
  });
});
