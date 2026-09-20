import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

const prisma = new PrismaClient();
const JWT_EXPIRATION = "10m";
const REFRESH_TOKEN_EXPIRATION = "7d";

// Функция регистрации (id генерируется на сервере)
export const signup = async (data: { password: string; device: string }) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await prisma.user.create({
    data: {
      password: hashedPassword,
    },
  });
  const tokens = await generateTokens(newUser.id, data.device);
  return { ...tokens, user: newUser };
};

// Функция входа
export const signin = async (id: string, password: string, device: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  return generateTokens(user.id, device);
};

// Обновление токенов
export const refreshToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
    const tokenRecord = await prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (
      !tokenRecord ||
      !tokenRecord.isValid ||
      new Date() > tokenRecord.expiresAt
    ) {
      throw new Error("Invalid or expired refresh token");
    }

    // Сгенерировать новые токены
    const newTokens = await generateTokens(
      tokenRecord.userId,
      tokenRecord.device
    );

    // Сделать старый refresh token недействительным
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { isValid: false },
    });

    return newTokens;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

// Получение информации о пользователе
export const getUserInfo = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// Выход из системы
export const logout = async (id: string, device: string) => {
  await prisma.token.updateMany({
    where: { userId: id, device },
    data: { isValid: false },
  });
};

// Генерация токенов
export const generateTokens = async (userId: string, device: string | null) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  const tokenData = {
    token: refreshToken,
    device,
    isValid: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    user: { connect: { id: userId } },
  };

  await prisma.token.create({ data: tokenData });

  return { accessToken, refreshToken };
};
