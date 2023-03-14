import express from "express";
import mongoose from "mongoose";
import router from "./routes/user-routes.js";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

const sslCert = {
  key: fs.readFileSync(path.join(process.cwd(), "keys", "ca.key")),
  cert: fs.readFileSync(path.join(process.cwd(), "keys", "ca.crt")),
};

app.use("/api/user", router);
app.use("/", (req, res, next) => {
  res.send("Server is succesfully running in browser...");
});
const port = 4000 || process.env.PORT;

mongoose
  .connect(
    `mongodb+srv://amol11talekar:${process.env.MONGO_DB_PASSWORD}@cluster0.lt4actf.mongodb.net/LE?retryWrites=true&w=majority`
  )
  .then(() => app.listen(port))
  .then(() => console.log("Database is connected and listening on port 4000"))
  .catch((err) =>
    console.log("there was error in connecting with Database : ", err)
  );
