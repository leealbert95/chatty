import "@/session";

import { Socket } from "socket.io";

import { saveMessage } from "@/api/message/messageService";
import { MessagePayload, RoomEvents } from "@shared/socket/socketData";

/**
 * Registers all room-related SocketIO event handlers for a connected socket.
 */
const registerRoomSocketHandlers = (socket: Socket): void => {
  /**
   * Adds the socket to a room's channel so it receives broadcast messages.
   */
  socket.on(RoomEvents.JOIN, (roomId: string) => {
    socket.join(roomId);
  });

  /**
   * Removes the socket from a room's channel.
   */
  socket.on(RoomEvents.LEAVE, (roomId: string) => {
    socket.leave(roomId);
  });

  /**
   * Persists a new message and broadcasts it to all members of the room.
   */
  socket.on(RoomEvents.POST_MESSAGE, async (data: string) => {
    const session = socket.request.session;
    const userId = session.userId as string;
    const parsedPayload = parseToMessagePayload(data);

    if (parsedPayload === null) {
      socket.emit(RoomEvents.MESSAGE_POST_FAILURE, {
        error: "Could not parse payload",
      });
      return;
    }

    const { temporaryMessageId, content, roomId, sentAt } = parsedPayload;

    try {
      await saveMessage({ content, roomId, sentAt, sentBy: userId });
      socket.to(roomId).emit(RoomEvents.NEW_MESSAGE, data);
      socket.emit(RoomEvents.MESSAGE_POST_SUCCESS);
    } catch (e) {
      socket.emit(RoomEvents.MESSAGE_POST_FAILURE, {
        messageId: temporaryMessageId,
      });
      console.log(e);
    }
  });

  const parseToMessagePayload = (data: string): MessagePayload | null => {
    try {
      return JSON.parse(data) as MessagePayload;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
};

export { registerRoomSocketHandlers };
