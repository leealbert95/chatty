import "./GroupList.scss";

import React from "react";

import { Room } from "../types";

interface GroupListProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

/**
 * Renders the left navigation bar listing all rooms the user belongs to.
 */
const GroupList: React.FC<GroupListProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
}) => {
  return (
    <nav className="group-list">
      <h2>Groups</h2>
      <ul>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={room.id === activeRoomId ? "active" : ""}
            onClick={() => onSelectRoom(room.id)}
          >
            # {room.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default GroupList;
