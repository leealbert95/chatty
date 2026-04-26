import { Request, Response, Router } from "express";

import {
  addUserToRoom,
  createRoom,
  listMembersForRoom,
  ResourceNotFoundError,
} from "./roomService";
import { requireAuth } from "@/api/auth/requireAuth";
import { AddMemberRequest } from "@shared/room/addMember";
import { CreateRoomRequest, CreateRoomResponse } from "@shared/room/createRoom";
import { JoinRoomRequest, JoinRoomResponse } from "@shared/room/joinRoom";
import { ListMembersResponse } from "@shared/room/listMembers";

const router = Router();

/**
 * Creates a new room and adds the requesting user as an admin member.
 */
router.post(
  "/create",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { name, type } = req.body as CreateRoomRequest;
    const userId = req.session.userId as string;
    try {
      const room = await createRoom(name, type, userId);
      res.status(201).json({ room } as CreateRoomResponse);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
);

/**
 * Adds the requesting user to the specified room.
 */
router.post(
  "/:roomId/join",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { roomId } = req.params;
    const { memberType } = req.body as JoinRoomRequest;
    const userId = req.session.userId as string;
    try {
      const room = await addUserToRoom(roomId, userId, memberType);
      res.json({ room } as JoinRoomResponse);
    } catch (err) {
      const status = err instanceof ResourceNotFoundError ? 404 : 500;
      res.status(status).json({ error: (err as Error).message });
    }
  },
);

/**
 * Returns the user profiles of all members belonging to the specified room.
 */
router.get(
  "/:roomId/members",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { roomId } = req.params;
    try {
      const members = await listMembersForRoom(roomId);
      res.json({ members, roomId } as ListMembersResponse);
    } catch (err) {
      console.log(err);
      res.status(404).json({ error: (err as Error).message });
    }
  },
);

/**
 * Adds specified user to the room.
 */
router.post(
  "/:roomId/add",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { roomId } = req.params;
    const { userId, memberType } = req.body as AddMemberRequest;
    try {
      const room = await addUserToRoom(roomId, userId, memberType);
      res.json({ room } as JoinRoomResponse);
    } catch (err) {
      const status = err instanceof ResourceNotFoundError ? 404 : 500;
      res.status(status).json({ error: (err as Error).message });
    }
  },
);

export { router };
