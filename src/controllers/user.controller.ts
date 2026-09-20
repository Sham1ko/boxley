import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { CustomRequest } from "../middlewares/auth.middleware";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const user = await userService.createUser(password);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserById = async (req: CustomRequest, res: Response) => {
  try {
    // selfMiddleware гарантирует, что :id — это id из токена
    const id = req.params.id;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const user = await userService.updateUser(id, updateData);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
