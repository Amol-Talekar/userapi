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

app.use("/", (req, res, next) => {
  res.send("Server is succesfully running in browser...");
});

app.use("/api/user", router);
const port = process.env.PORT || 4000;

mongoose
  .connect(
    `mongodb+srv://amol11talekar:${process.env.MONGO_DB_PASSWORD}@cluster0.lt4actf.mongodb.net/LE?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true, // Enable SSL/TLS
      sslValidate: false, // Disable server certificate validation (for demo purposes only)
    }
  )
  .then(() => app.listen(`${port}`))
  .then(() => console.log("Database is connected and listening on port 4000"))
  .catch((err) =>
    console.log("there was error in connecting with Database : ", err)
  );
