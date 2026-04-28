import { Request, Response, Router } from "express";

import { listRoomsForUser } from "@/service/userInfoService";
import { requireAuth } from "@/api/auth/requireAuth";

const router = Router();

/**
 * Returns all rooms the authenticated user belongs to.
 */
router.get(
  "/rooms",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.session.userId;
    try {
      const rooms = await listRoomsForUser(userId as string);
      res.json({ rooms, userId });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
);

export { router };
