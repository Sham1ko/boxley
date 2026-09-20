import { Request, Response } from "express";
import * as authService from "../services/auth.service";

// Регистрация пользователя
export const signup = async (req: Request, res: Response) => {
  try {
    const { password, device } = req.body;
    const user = await authService.signup({ password, device });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Вход пользователя
export const signin = async (req: Request, res: Response) => {
  try {
    const { id, password, device } = req.body;
    const tokens = await authService.signin(id, password, device);
    res.status(200).json(tokens);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Обновление токена
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const newTokens = await authService.refreshToken(refreshToken);
    res.status(200).json(newTokens);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Получение информации о пользователе
export const getUserInfo = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userInfo = await authService.getUserInfo(userId);
    res.status(200).json(userInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Выход из системы
export const logout = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { device } = req.body; // Передаем device в теле запроса
    await authService.logout(userId, device);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
