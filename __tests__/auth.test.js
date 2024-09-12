import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import app from "../app"; // Import your express app here
import User from "../models/user";
import Admin from "../models/admin";

jest.mock("jsonwebtoken");

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

beforeEach(async () => {
  await User.deleteMany({});
  await Admin.deleteMany({});
});

describe("Auth Routes", () => {
  describe("POST /signup", () => {
    it("should successfully create a new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        age: "25",
        gender: "male",
        height: "180",
        weight: "75",
        activityLevel: "active",
        goals: "weight loss",
      };

      const res = await request(app).post("/auth/signup").send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty("email", "john@example.com");
    });

    it("should return 400 if the user already exists", async () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        age: 25,
        gender: "male",
        height: 180,
        weight: 75,
        activityLevel: "active",
        goals: "weight loss",
      });

      await user.save();

      const res = await request(app).post("/auth/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        age: 25,
        gender: "male",
        height: 180,
        weight: 75,
        activityLevel: "active",
        goals: "weight loss",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists with this email");
    });
  });

  describe("POST /signin", () => {
    it("should successfully sign in a user", async () => {
      const password = await bcrypt.hash("Password123!", 10);

      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password,
        age: 25,
        gender: "male",
        height: 180,
        weight: 75,
        activityLevel: "active",
        goals: "weight loss",
      });

      await user.save();

      jwt.sign.mockReturnValue("fakeToken");

      const res = await request(app).post("/auth/signin").send({
        email: "john@example.com",
        password: "Password123!",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Logged in successfully");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should return 400 for invalid credentials", async () => {
      const res = await request(app).post("/auth/signin").send({
        email: "wrong@example.com",
        password: "wrongPassword",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /signout", () => {
    it("should successfully sign out a user", async () => {
      const res = await request(app)
        .post("/auth/signout")
        .set("Authorization", `Bearer fakeToken`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Logged out successfully");
    });
  });

  describe("POST /refresh-token", () => {
    it("should successfully refresh the access token", async () => {
      const refreshToken = jwt.sign(
        { userId: "fakeUserId" },
        process.env.REFRESH_TOKEN_SECRET
      );

      jwt.verify.mockImplementationOnce((token, secret, callback) =>
        callback(null, { userId: "fakeUserId" })
      );

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Access token refreshed successfully"
      );
    });

    it("should return 401 if refresh token is invalid", async () => {
      jwt.verify.mockImplementationOnce((token, secret, callback) =>
        callback(new Error("Invalid token"))
      );

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", ["refreshToken=invalidToken"]);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });
  });
});
