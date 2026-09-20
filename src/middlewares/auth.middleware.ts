import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

export interface CustomRequest<P = ParamsDictionary> extends Request<P> {
  user?: any;
}

export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Доступ к /:id разрешён только владельцу токена
export const selfMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.id !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
