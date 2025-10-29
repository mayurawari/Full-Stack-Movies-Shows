import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const moviemodel = sequelize.define("Movie", {
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  director: DataTypes.STRING,
  budget: DataTypes.STRING,
  location: DataTypes.STRING,
  duration: DataTypes.STRING,
  year: DataTypes.STRING,
  poster: DataTypes.STRING,
});

export default moviemodel;
