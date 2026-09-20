import { Router } from "express";
import {
  signup,
  signin,
  refreshToken,
  getUserInfo,
  logout,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import authValidation from "../validations/auth.validation";

const authRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user's unique identifier
 *         password:
 *           type: string
 *           description: The user's password
 *         device:
 *           type: string
 *           description: The device identifier
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               device:
 *                 type: string
 *             required:
 *               - password
 *               - device
 *     responses:
 *       201:
 *         description: User created successfully (id is generated server-side)
 *       400:
 *         description: Bad request
 */
authRouter.route("/signup").post(validate(authValidation.register), signup);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               password:
 *                 type: string
 *               device:
 *                 type: string
 *             required:
 *               - id
 *               - password
 *               - device
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.route("/signin").post(validate(authValidation.login), signin);

/**
 * @swagger
 * /auth/signin/new_token:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: New token generated successfully
 *       401:
 *         description: Unauthorized
 */
authRouter
  .route("/signin/new_token")
  .post(validate(authValidation.refreshToken), refreshToken);

/**
 * @swagger
 * /auth/info:
 *   get:
 *     summary: Get user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/info", authMiddleware, getUserInfo);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device:
 *                 type: string
 *                 description: The device identifier
 *             required:
 *               - device
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.post(
  "/logout",
  authMiddleware,
  validate(authValidation.logout),
  logout
);

export default authRouter;
