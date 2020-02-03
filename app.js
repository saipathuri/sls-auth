import authRouter from "./routes/auth";
import cors from "cors";
import express, { json } from "express";
import morgan from "morgan";
import { isDevEnvironment } from "./config/config";

const app = express();

if (isDevEnvironment()) {
  app.use(morgan("combined"));
}

app.use(cors());
app.use(json());
app.use("/", authRouter);

export default app;
