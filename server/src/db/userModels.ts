import {
  CreationOptional,
  DataTypes,
  HasOne,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "@/db/connection";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId: string;
  declare name: string;
  declare email: string;
  declare profilePicture: string | null;
  declare createdAt: CreationOptional<Date>;
  static UserCredentials: HasOne;
}

User.init(
  {
    userId: { type: DataTypes.STRING(45), primaryKey: true },
    name: { type: DataTypes.STRING(45), allowNull: false },
    email: { type: DataTypes.STRING(45), allowNull: false },
    profilePicture: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

class UserCredentials extends Model<
  InferAttributes<UserCredentials>,
  InferCreationAttributes<UserCredentials>
> {
  declare userId: string;
  declare password: string;
}

UserCredentials.init(
  {
    userId: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      references: { model: User, key: "user_id" },
    },
    password: { type: DataTypes.STRING(60), allowNull: false },
  },
  {
    sequelize,
    modelName: "UserCredentials",
    tableName: "user_credentials",
    timestamps: true,
    underscored: true,
  },
);

UserCredentials.User = UserCredentials.belongsTo(User, {
  foreignKey: "userId",
  onUpdate: "RESTRICT",
  onDelete: "CASCADE",
});
User.UserCredentials = User.hasOne(UserCredentials);

export { User, UserCredentials };
