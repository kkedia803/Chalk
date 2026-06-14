import express from "express";
import cors from 'cors';

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

import executeRouter from "./routes/execute.route";
import authRouter from "./routes/auth.route";

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server working fine" });
});

app.use("/", executeRouter);
app.use("/auth/google", authRouter);

export default app;
