import jwt from "jsonwebtoken";
import Blacklistedtoken from "../models/blacklistedtokenmodel.js";

const JWT_SECRET = process.env.KEY;

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const blacklisted = await Blacklistedtoken.findOne({ where: { token } });
    if (blacklisted) return res.status(401).json({ message: "Token has been logged out" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email }; // attach minimal user
    return next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
