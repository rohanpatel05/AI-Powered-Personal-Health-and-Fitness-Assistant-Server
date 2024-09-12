import request from "supertest";
import mongoose from "mongoose";
import app from "../app"; // Assume your Express app is in a file named app.js
import Admin from "../models/admin";
import User from "../models/user";
import { MongoMemoryServer } from "mongodb-memory-server";

// Mock the adminAuthMiddleware for testing purposes
jest.mock("../middlewares/adminAuthMiddleware", () => (req, res, next) => {
  req.admin = { id: "adminId", role: "admin" };
  next();
});

describe("Admin Routes", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear collections after each test
    await Admin.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /admin/users", () => {
    it("should return all users", async () => {
      // Seed some users
      const user1 = await User.create({
        name: "John",
        email: "john@example.com",
        password: "password",
      });
      const user2 = await User.create({
        name: "Jane",
        email: "jane@example.com",
        password: "password",
      });

      const res = await request(app).get("/admin/users");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty("name", "John");
      expect(res.body[0]).not.toHaveProperty("password");
    });
  });

  describe("GET /admin/users/:id", () => {
    it("should return user by ID", async () => {
      const user = await User.create({
        name: "John",
        email: "john@example.com",
        password: "password",
      });

      const res = await request(app).get(`/admin/users/${user._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "John");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 404 if user is not found", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/admin/users/${invalidId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found.");
    });
  });

  describe("PUT /admin/users/:id", () => {
    it("should update user info if data is valid", async () => {
      const user = await User.create({
        name: "John",
        email: "john@example.com",
        password: "password",
      });
      const updatedData = {
        name: "John Updated",
        age: "30",
        gender: "Male",
        height: "6ft",
        weight: "180",
        activityLevel: "Active",
        goals: "Weight Loss",
      };

      const res = await request(app)
        .put(`/admin/users/${user._id}`)
        .send(updatedData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "John Updated");
    });

    it("should return 400 if validation fails", async () => {
      const user = await User.create({
        name: "John",
        email: "john@example.com",
        password: "password",
      });
      const invalidData = { name: "", age: "invalidAge" };

      const res = await request(app)
        .put(`/admin/users/${user._id}`)
        .send(invalidData);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("DELETE /admin/users/:id", () => {
    it("should delete a user by ID", async () => {
      const user = await User.create({
        name: "John",
        email: "john@example.com",
        password: "password",
      });

      const res = await request(app).delete(`/admin/users/${user._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted successfully.");
    });

    it("should return 404 if user is not found", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/admin/users/${invalidId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found.");
    });
  });

  describe("POST /admin/admins", () => {
    it("should create a new admin", async () => {
      const adminData = {
        name: "Admin1",
        email: "admin1@example.com",
        password: "password123",
        role: "admin",
      };

      const res = await request(app).post("/admin/admins").send(adminData);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Admin created successfully.");
    });

    it("should return 400 if admin already exists", async () => {
      await Admin.create({
        name: "Admin1",
        email: "admin1@example.com",
        password: "password123",
        role: "admin",
      });

      const res = await request(app).post("/admin/admins").send({
        name: "Admin1",
        email: "admin1@example.com",
        password: "password123",
        role: "admin",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Admin already exists.");
    });
  });
});
