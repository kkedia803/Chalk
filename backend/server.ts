import dotenv from 'dotenv'
dotenv.config();
const port = process.env.PORT;
import app from "./app";
import { initDB } from "./db";

const startServer = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`Listening at port : ${port}`);
  });
};

startServer();
