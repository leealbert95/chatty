import "./MainPage.scss";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { Message, Room } from "../types";
import ChatWindow from "./ChatWindow";
import GroupList from "./GroupList";
import MessageInput from "./MessageInput";
import { fetchMessages, fetchRooms } from "./chatApi";
import { getSocket } from "./socket";

/**
 * Renders the main chat layout: room list on the left, active chat on the right.
 */
const MainPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, Message[]>
  >({});

  useEffect(() => {
    fetchRooms().then(setRooms).catch(console.error);

    const socket = getSocket();
    socket.on("message", (msg: Message) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [msg.room]: [...(prev[msg.room] ?? []), msg],
      }));
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (roomId === undefined) return;
    fetchMessages(roomId)
      .then((messages) =>
        setMessagesByRoom((prev) => ({ ...prev, [roomId]: messages })),
      )
      .catch(console.error);
  }, [roomId]);

  const handleSelectRoom = (id: string): void => {
    navigate(`/room/${id}`);
  };

  const handleSend = (content: string): void => {
    if (roomId === undefined || user === null) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      author: user.id,
      room: roomId,
      timeSent: new Date(),
    };

    // TODO: replace local state update with ChatService.postMessage via SocketIO
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] ?? []), newMessage],
    }));
  };

  const activeMessages =
    roomId !== undefined ? (messagesByRoom[roomId] ?? []) : [];
  const activeRoom = rooms.find((r) => r.id === roomId);

  return (
    <div className="main-page">
      <GroupList
        rooms={rooms}
        activeRoomId={roomId ?? null}
        onSelectRoom={handleSelectRoom}
      />
      {roomId === undefined ? (
        <div className="no-room">Open a room</div>
      ) : (
        <div className="chat-area">
          <header className="chat-header">
            <span>
              {activeRoom !== undefined ? `# ${activeRoom.name}` : ""}
            </span>
            <button className="logout-btn" onClick={logout} type="button">
              Log Out
            </button>
          </header>
          <ChatWindow
            messages={activeMessages}
            currentUserId={user?.id ?? ""}
          />
          <MessageInput onSend={handleSend} />
        </div>
      )}
    </div>
  );
};

export default MainPage;
