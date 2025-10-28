import { Sequelize } from "sequelize";
import { config } from "dotenv";
config();

export const sequelize = new Sequelize(
  "defaultdb",
  "avnadmin",
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connectDb;

