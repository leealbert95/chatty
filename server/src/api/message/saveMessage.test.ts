import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
    },
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid"),
}));

import { prisma } from "@/prisma";
import { saveMessage } from "./saveMessage";

beforeEach(() => vi.clearAllMocks());

describe("saveMessage", () => {
  it("creates a message with the correct data", async () => {
    vi.mocked(prisma.message.create).mockResolvedValue(undefined as any);
    const sentAt = "2024-01-01T12:00:00.000Z";

    await saveMessage({ content: "Hello", roomId: "room-1", sentBy: "u-1", sentAt });

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        messageId: "mmock-uuid",
        content: "Hello",
        roomId: "room-1",
        sentBy: "u-1",
        sentAt: new Date(sentAt),
      },
    });
  });
});
