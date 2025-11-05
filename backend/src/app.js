import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cookieParser from "cookie-parser";
dotenv.config();


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authRoutes )
app.use("/api/v1",chatRoutes)

export default app;


