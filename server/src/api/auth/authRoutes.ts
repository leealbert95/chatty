import "@/session";

import { Request, Response, Router } from "express";

import {
  authenticateUser,
  InvalidCredentialsError,
  registerUser,
  UserAlreadyExistsError,
} from "./authService";
import { LoginRequest, LoginResponse } from "@shared/user/login";
import { RegisterRequest, RegisterResponse } from "@shared/user/register";

const router = Router();

/**
 * Registers a new user and starts a session.
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as RegisterRequest;
  try {
    const user = await registerUser(name, email, password);
    req.session.userId = user.userId;
    res.status(201).json({
      id: user.userId,
      name: user.name,
      email: user.email,
    } as RegisterResponse);
  } catch (err) {
    console.log(err);
    const code = err instanceof UserAlreadyExistsError ? 409 : 500;
    res.status(code).json({ error: (err as Error).message });
  }
});

/**
 * Authenticates a user by email and password and starts a session.
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequest;
  try {
    const user = await authenticateUser(email, password);
    req.session.userId = user.userId;
    res.json({
      id: user.userId,
      name: user.name,
      email: user.email,
    } as LoginResponse);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({
        error: (err as Error).message,
        reason: err.invalidCredentialsCase,
      });
    } else {
      res.status(500).json({ error: (err as Error).message });
    }
  }
});

/**
 * Ends the current user session.
 */
router.post("/logout", (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.json({ message: "Logged out" });
  });
});

export { router };
