import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//use method is mostly used when dealing with some kind of middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//using routes

import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);

export { app };
