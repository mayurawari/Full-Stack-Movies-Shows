import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";
import connectDb, { sequelize } from "./src/config/db.js";
import mvroute from "./src/routes/movies.js";
import authroute from "./src/routes/authroute.js";
import { auth } from "./src/middlewares/auth.js";

const server = express();
const port = process.env.PORT || 9090;

server.use(cors());
server.use(express.json());
server.use("/auth",authroute);
server.use("/moviesapi",auth,mvroute);

server.get("/", (req, res) => {
  res.send("Home Route");
});

// to keep the connection alive with aivendb.
// health route (for UptimeRobot or manual checks)
server.get("/health", async (req, res) => {
  try {
    await sequelize.query("SELECT 1;");
    res.status(200).json({ status: "ok", time: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

server.listen(port, async () => {
  try {
    await connectDb();
    sequelize.sync();
    console.log("Connected to DB.");
    console.log(`Server Started on port : ${port}`);
  } catch (error) {
    console.log(error, "Error in server Home Listen");
  }
});
