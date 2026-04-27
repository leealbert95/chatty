import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/prisma", () => ({
  prisma: {
    message: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/prisma";
import { listMessages } from "./messageService";

const mockPrismaMessage = {
  messageId: "m-test-1",
  content: "Hello world",
  roomId: "room-1",
  sentBy: "u-sender-1",
  sentAt: new Date("2024-01-01T12:00:00.000Z"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

describe("listMessages", () => {
  it("returns messages mapped to DTOs ordered by sentAt", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue([mockPrismaMessage] as any);

    const result = await listMessages("room-1");

    expect(result).toEqual([
      {
        messageId: "m-test-1",
        content: "Hello world",
        roomId: "room-1",
        sentBy: "u-sender-1",
        sentAt: "2024-01-01T12:00:00.000Z",
      },
    ]);
    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sentAt: "asc" } }),
    );
  });

  it("applies the correct skip and take for the given page and pageSize", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    await listMessages("room-1", 3, 20);

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
      orderBy: { sentAt: "asc" },
      take: 20,
      skip: 40,
    });
  });

  it("defaults to page 1 and pageSize 50 when not provided", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    await listMessages("room-1");

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
      orderBy: { sentAt: "asc" },
      take: 50,
      skip: 0,
    });
  });

  it("returns an empty array when there are no messages", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);

    const result = await listMessages("room-1");

    expect(result).toEqual([]);
  });
});

