import "./ChatWindow.scss";

import React, { useEffect, useRef } from "react";

import { Message } from "../types";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Renders the scrollable message history for the active room.
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg) => {
        const isOwn = msg.author === currentUserId;
        return (
          <div key={msg.id} className={`message ${isOwn ? "own" : "other"}`}>
            <span className="content">{msg.content}</span>
            <span className="time">{formatTime(msg.timeSent)}</span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
