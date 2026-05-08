import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAdd = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(function (this: { add: typeof mockAdd }) {
    this.add = mockAdd;
  }),
}));

vi.mock("@/connection", () => ({
  connection: { host: "localhost", port: 6379 },
}));

import { Queue } from "bullmq";
import { MessageQueueEvents } from "@shared/queue/messageQueueEvents";
import { registerMessageSocketHandlers } from "./messageSocketHandlers";

const mockPayload = {
  temporaryMessageId: "temp-1",
  content: "Hello world",
  roomId: "room-1",
  sentAt: "2024-01-01T12:00:00.000Z",
};

const createMockSocket = () => {
  const handlers: Record<string, (...args: any[]) => any> = {};

  const socket = {
    on: (event: string, handler: (...args: any[]) => any) => {
      handlers[event] = handler;
    },
    emit: vi.fn(),
  };

  return { socket, handlers };
};

beforeEach(() => vi.clearAllMocks());

describe("MESSAGE_QUEUED handler", () => {
  it("adds the parsed message to the queue", async () => {
    const { socket, handlers } = createMockSocket();
    registerMessageSocketHandlers(socket as any);

    await handlers[MessageQueueEvents.MESSAGE_QUEUED](JSON.stringify(mockPayload));

    expect(Queue).toHaveBeenCalledWith("messages", expect.anything());
    expect(mockAdd).toHaveBeenCalledWith("message", mockPayload, {
      jobId: mockPayload.temporaryMessageId,
    });
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("emits MESSAGE_SAVE_FAIL when the payload is not valid JSON", async () => {
    const { socket, handlers } = createMockSocket();
    registerMessageSocketHandlers(socket as any);

    await handlers[MessageQueueEvents.MESSAGE_QUEUED]("not-valid-json");

    expect(socket.emit).toHaveBeenCalledWith(
      MessageQueueEvents.MESSAGE_SAVE_FAIL,
      "Could not parse payload",
    );
    expect(Queue).not.toHaveBeenCalled();
    expect(mockAdd).not.toHaveBeenCalled();
  });
});
