import React, { useState } from "react";

import "./MessageInput.scss";

interface MessageInputProps {
  onSend: (content: string) => void;
}

/**
 * Renders the message composition area with a textarea and send button.
 */
const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (trimmed === "") return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
      />
      <button onClick={handleSend} type="button">
        Send
      </button>
    </div>
  );
};

export default MessageInput;
