import "@/session";

import { NextFunction, Request, Response } from "express";

/**
 * Rejects requests from users who do not have an active session.
 */
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.userId === undefined) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
};

export { requireAuth };
