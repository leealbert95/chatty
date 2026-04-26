import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { Room } from "./roomModels";
import { User } from "./userModels";
import { sequelize } from "@/db/connection";
import { MessageDto } from "@shared/message/message";

class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare messageId: string;
  declare content: string;
  declare roomId: string;
  declare sentBy: string;
  declare sentAt: Date;

  /** Converts this model instance to a shared Message for API responses. */
  toMessageDto(): MessageDto {
    return {
      messageId: this.messageId,
      content: this.content,
      roomId: this.roomId,
      sentBy: this.sentBy,
      sentAt: this.sentAt.toISOString(),
    };
  }
}

Message.init(
  {
    messageId: {
      type: DataTypes.STRING(45),
      primaryKey: true,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    roomId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: { model: Room, key: "room_id" },
    },
    sentBy: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    sentAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: true,
    underscored: true,
  },
);

Message.belongsTo(Room, {
  foreignKey: "roomId",
  onUpdate: "RESTRICT",
  onDelete: "CASCADE",
});
Room.hasMany(Message);

Message.belongsTo(User, {
  foreignKey: "sentBy",
  onUpdate: "RESTRICT",
  onDelete: "SET NULL",
});
User.hasMany(Message);

export { Message };
