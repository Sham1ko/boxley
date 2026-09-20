import supertest from "supertest";
import app from "../../src/app";
import setupTestDB from "../utils/setupTestDB";

setupTestDB();

describe("Auth: signup", () => {
  it("should register a new user with a server-generated id", async () => {
    const response = await supertest(app)
      .post("/api/auth/signup")
      .send({ password: "password123", device: "test-device" })
      .expect(201);

    expect(response.body.user.id).toEqual(expect.any(String));
    expect(response.body.user.id.length).toBeGreaterThan(0);
    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("should reject signup without password", async () => {
    await supertest(app)
      .post("/api/auth/signup")
      .send({ device: "test-device" })
      .expect(400);
  });
});
