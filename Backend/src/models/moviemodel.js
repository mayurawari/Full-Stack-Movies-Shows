import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./usermodel.js";

const moviemodel = sequelize.define("Movie", {
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // "Movie" | "TV Show"
  director: DataTypes.STRING,
  budget: DataTypes.STRING,
  location: DataTypes.STRING,
  duration: DataTypes.STRING,
  year: DataTypes.STRING,
  poster: DataTypes.STRING,
  userId: { type: DataTypes.INTEGER, allowNull: false }, // owner column
}, {
  indexes: [
    { fields: ["userId"] },
    // Example uniqueness inside a user’s collection
    // { unique: true, fields: ["userId", "title", "year"] },
  ],
});

// Optional association (not required for queries but useful for includes)
User.hasMany(moviemodel, { foreignKey: "userId", onDelete: "CASCADE" });
moviemodel.belongsTo(User, { foreignKey: "userId" });

export default moviemodel;
