import dotenv from 'dotenv'
dotenv.config();
const port = process.env.PORT;
import app from "./app";
import { testDB } from './db';

const startServer = async () => {
  await testDB();
  app.listen(port, () => {
    console.log(`Listening at port : ${port}`);
  });
};

startServer();
