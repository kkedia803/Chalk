import dotenv from 'dotenv'
dotenv.config();
const port = process.env.PORT;
import app from "./app";

app.listen(port, () => {
  console.log(`Listening at port : ${port}`);
});
