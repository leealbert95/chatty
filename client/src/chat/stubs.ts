import { Room, Message } from "../types";

const STUB_ROOMS: Room[] = [
  { id: "room-1", name: "General", isRoom: true, members: ["1", "2", "3"] },
  { id: "room-2", name: "Random", isRoom: true, members: ["1", "2"] },
  { id: "room-3", name: "Engineering", isRoom: true, members: ["1", "3"] },
];

const STUB_MESSAGES: Record<string, Message[]> = {
  "room-1": [
    {
      id: "msg-1",
      content: "Welcome to General!",
      author: "2",
      room: "room-1",
      timeSent: Date.now() - 120000,
    },
    {
      id: "msg-2",
      content: "Thanks! Happy to be here.",
      author: "1",
      room: "room-1",
      timeSent: Date.now() - 60000,
    },
  ],
  "room-2": [
    {
      id: "msg-3",
      content: "Anything goes here 🎉",
      author: "3",
      room: "room-2",
      timeSent: Date.now() - 300000,
    },
  ],
  "room-3": [],
};

export { STUB_ROOMS, STUB_MESSAGES };
