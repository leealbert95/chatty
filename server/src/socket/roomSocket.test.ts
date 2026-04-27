import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomEvents } from "@shared/socket/roomSocketData";

vi.mock("@/api/message/messageService", () => ({
  saveMessage: vi.fn(),
}));

import { saveMessage } from "@/api/message/messageService";
import { registerRoomSocketHandlers } from "./roomSocket";

const createMockSocket = (userId = "u-test-user") => {
  const handlers: Record<string, (...args: any[]) => any> = {};
  const roomEmit = vi.fn();

  const socket = {
    on: (event: string, handler: (...args: any[]) => any) => {
      handlers[event] = handler;
    },
    join: vi.fn(),
    leave: vi.fn(),
    emit: vi.fn(),
    to: vi.fn().mockReturnValue({ emit: roomEmit }),
    request: { session: { userId } },
  };

  return { socket, handlers, roomEmit };
};

const mockPayload = {
  temporaryMessageId: "temp-1",
  content: "Hello world",
  roomId: "room-1",
  sentAt: "2024-01-01T12:00:00.000Z",
};

beforeEach(() => vi.clearAllMocks());

describe("JOIN handler", () => {
  it("adds the socket to the room channel", () => {
    const { socket, handlers } = createMockSocket();
    registerRoomSocketHandlers(socket as any);

    handlers[RoomEvents.JOIN]("room-1");

    expect(socket.join).toHaveBeenCalledWith("room-1");
  });
});

describe("LEAVE handler", () => {
  it("removes the socket from the room channel", () => {
    const { socket, handlers } = createMockSocket();
    registerRoomSocketHandlers(socket as any);

    handlers[RoomEvents.LEAVE]("room-1");

    expect(socket.leave).toHaveBeenCalledWith("room-1");
  });
});

describe("POST_MESSAGE handler", () => {
  it("saves the message, broadcasts to room, and emits success to sender", async () => {
    vi.mocked(saveMessage).mockResolvedValue(undefined);
    const { socket, handlers, roomEmit } = createMockSocket("u-sender");
    registerRoomSocketHandlers(socket as any);
    const raw = JSON.stringify(mockPayload);

    await handlers[RoomEvents.POST_MESSAGE](raw);

    expect(saveMessage).toHaveBeenCalledWith({
      content: mockPayload.content,
      roomId: mockPayload.roomId,
      sentAt: mockPayload.sentAt,
      sentBy: "u-sender",
    });
    expect(socket.to).toHaveBeenCalledWith(mockPayload.roomId);
    expect(roomEmit).toHaveBeenCalledWith(RoomEvents.NEW_MESSAGE, raw);
    expect(socket.emit).toHaveBeenCalledWith(RoomEvents.MESSAGE_POST_SUCCESS);
  });

  it("emits MESSAGE_POST_FAILURE with an error message when the payload is not valid JSON", async () => {
    const { socket, handlers } = createMockSocket();
    registerRoomSocketHandlers(socket as any);

    await handlers[RoomEvents.POST_MESSAGE]("not-valid-json");

    expect(saveMessage).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(RoomEvents.MESSAGE_POST_FAILURE, {
      error: "Could not parse payload",
    });
  });

  it("emits MESSAGE_POST_FAILURE with the temporaryMessageId when saveMessage throws", async () => {
    vi.mocked(saveMessage).mockRejectedValue(new Error("Database error"));
    const { socket, handlers } = createMockSocket();
    registerRoomSocketHandlers(socket as any);

    await handlers[RoomEvents.POST_MESSAGE](JSON.stringify(mockPayload));

    expect(socket.emit).toHaveBeenCalledWith(RoomEvents.MESSAGE_POST_FAILURE, {
      messageId: mockPayload.temporaryMessageId,
    });
  });
});
