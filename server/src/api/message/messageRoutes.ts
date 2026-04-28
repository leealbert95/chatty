import { Request, Response, Router } from "express";

import { listMessages } from "@/service/messageService";
import { requireAuth } from "@/api/auth/requireAuth";
import { ListMessagesResponse } from "@shared/message/listMessages";

const router = Router();

/**
 * Returns a paginated list of messages for the specified room.
 * Query params: page (default 1), pageSize (default 50).
 */
router.get(
  "/:roomId/messages",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { roomId } = req.params;
    const page = parseInt(req.query["page"] as string, 10) || 1;
    const pageSize = parseInt(req.query["pageSize"] as string, 10) || 50;
    try {
      const messages = await listMessages(roomId, page, pageSize);
      res.json({ messages, nextPage: page + 1 } as ListMessagesResponse);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
);

export { router };
