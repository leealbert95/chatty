interface MessageDto {
  messageId: string;
  content: string;
  roomId: string;
  sentBy: string;
  sentAt: string; // ISO 8601 date string
}

export { MessageDto };
