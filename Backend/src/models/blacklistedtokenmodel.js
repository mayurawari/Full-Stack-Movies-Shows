import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Blacklistedtoken = sequelize.define("blacklistedtoken", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

export default Blacklistedtoken;
