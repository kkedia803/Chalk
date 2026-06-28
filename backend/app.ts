import express from "express";
import cors from "cors";

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

import executeRouter from "./routes/execute.route";
import authRouter from "./routes/auth.route";
import projectsRouter from "./routes/projects.route";
import { meController } from "./controllers/login.controller";
import { verifyJwt } from "./middleware/verifyJwt";

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server working fine" });
});

app.use("/", executeRouter);
app.use("/auth/google", authRouter);
app.get("/auth/me", verifyJwt, meController);
app.use("/", projectsRouter);

export default app;
