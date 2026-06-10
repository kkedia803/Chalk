import { Queue } from "bullmq";
import { connection } from "./redis";

export const codeQueue = new Queue("code-execution", {
  connection,
});
