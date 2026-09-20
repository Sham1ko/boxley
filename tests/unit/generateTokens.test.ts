import setupTestDB from "../utils/setupTestDB";
import jwt from "jsonwebtoken";
import * as authService from "../../src/services/auth.service";
import { JWT_SECRET } from "../../src/config/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

setupTestDB();

describe("Generate Tokens", () => {
  let userId: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        id: "testuser-" + Date.now(), // Уникальный ID
        password: hashedPassword,
      },
    });
    userId = user.id;
  });

  it("should generate valid access and refresh tokens", async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User was not created successfully");
    }

    const device = "test-device";
    const tokens = await authService.generateTokens(userId, device);

    const decodedAccessToken = jwt.verify(tokens.accessToken, JWT_SECRET);
    const decodedRefreshToken = jwt.verify(tokens.refreshToken, JWT_SECRET);

    expect(decodedAccessToken).toHaveProperty("id", userId);
    expect(decodedRefreshToken).toHaveProperty("id", userId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
