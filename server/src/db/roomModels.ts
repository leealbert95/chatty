import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { User } from "./userModels";
import { sequelize } from "@/db/connection";
import { MemberType } from "@shared/room/member";
import { RoomDto, RoomType } from "@shared/room/room";

class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
  declare roomId: string;
  declare name: string;
  declare type: RoomType;
  declare createdAt: CreationOptional<Date>;

  /** Converts this model instance to a plain RoomDto for API responses. */
  toRoomDto(): RoomDto {
    return {
      roomId: this.roomId,
      name: this.name,
      type: this.type,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

Room.init(
  {
    roomId: { type: DataTypes.STRING(45), primaryKey: true },
    name: { type: DataTypes.STRING(45), allowNull: false },
    type: { type: DataTypes.ENUM("dm", "room"), allowNull: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Room",
    tableName: "rooms",
    timestamps: true,
    underscored: true,
  },
);

class RoomMembership extends Model<
  InferAttributes<RoomMembership>,
  InferCreationAttributes<RoomMembership>
> {
  declare userId: string;
  declare roomId: string;
  declare membershipType: CreationOptional<MemberType>;
  declare createdAt: CreationOptional<Date>;
}

RoomMembership.init(
  {
    userId: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      references: { model: User, key: "user_id" },
    },
    roomId: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      references: { model: Room, key: "room_id" },
    },
    membershipType: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "RoomMembership",
    tableName: "room_memberships",
    timestamps: true,
    underscored: true,
  },
);

RoomMembership.belongsTo(Room, {
  foreignKey: "roomId",
  onUpdate: "RESTRICT",
  onDelete: "CASCADE",
});
Room.hasMany(RoomMembership);

RoomMembership.belongsTo(User, {
  foreignKey: "userId",
  onUpdate: "RESTRICT",
  onDelete: "CASCADE",
});
User.hasMany(RoomMembership);

export { Room, RoomMembership };
