/** Represents a registered user. */
interface User {
  id: string;
  name: string;
  email: string;
}

/** Represents a chat room and its members. */
interface Room {
  id: string;
  name: string;
  isRoom: boolean;
  members: string[];
}

/** Represents a single chat message. */
interface Message {
  id: string;
  content: string;
  author: string;
  room: string;
  timeSent: Date;
}

export { User, Room, Message };
