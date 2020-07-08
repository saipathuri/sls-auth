import authRouter from "./routes/Auth";
import cors from "cors";
import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";

import { isDevEnvironment } from "./config/Config";

const app = express();

if (isDevEnvironment()) {
  app.use(morgan("combined"));
}

app.use(helmet());
app.use(cors());
app.use(json());
app.use("/", authRouter);
app.use("/auth", authRouter);

export default app;
