import request from "supertest";
import "dotenv/config";
import app from "../app.js";

test("GET /test should return status 200 and a success message for /test route", async () => {
  const response = await request(app).get("/test");
  expect(response.status).toBe(200);
  expect(response.text).toBe("It's working!");
});

test("POST /test should parse JSON requests using express.json middleware", async () => {
  const response = await request(app)
    .post("/test")
    .send({ message: "Hello, world!" });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Hello, world!");
});
