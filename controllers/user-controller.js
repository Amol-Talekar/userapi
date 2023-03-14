import { json } from "express";
import bcrypt from "bcryptjs";
import NodeRSA from "node-rsa";
import User from "../model/User.js";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Read the private key data from the PEM file
const privateKeyData = fs.readFileSync(
  "C:/MyCode/All Practice Projects/user-authentication-backend-app/keys/privateKey.pem"
);

// Create a private key object from the key data
const privateKey = crypto.createPrivateKey(privateKeyData);

const privateKeyBuffer = privateKey.export({ type: "pkcs8", format: "pem" });

const publicKeyData = fs.readFileSync(
  "C:/MyCode/All Practice Projects/user-authentication-backend-app/keys/publicKey.pem"
);
const publicKey = crypto.createPublicKey(publicKeyData);

export const getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (err) {
    return console.log("getallUsers error : ", err);
  }

  if (!users) {
    return res.status(404).json({ message: "No Users Found in Database" });
  }

  if (users) {
    console.log("this is users second times => ", users);
    // let usersData = [];

    // usersData = users.map((user) => {
    //   const decryptedName = crypto.privateDecrypt(privateKey, user.name);
    //   const decryptedEmail = crypto.privateDecrypt(privateKey, user.email);
    //   const decryptedMobile = crypto.privateDecrypt(privateKey, user.mobile);
    //   const isPasswordMatch = bcrypt.compareSync(req.password, user.password);
    //   console.log(
    //     "decerypted objects in userdata ==> ",
    //     decryptedName,
    //     decryptedEmail,
    //     decryptedMobile,
    //     isPasswordMatch
    //   );
    //   return {
    //     name: decryptedName,
    //     email: decryptedEmail,
    //     mobile: decryptedMobile,
    //     password: isPasswordMatch ? "Matched" : "Not matched",
    //   };
    // });

    return res.status(200).json(users);
  }
};

export const signup = async (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return console.log(" existingUser from signup err : ", err);
  }

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User Already Exits ! Login Instead" });
  }

  // let test1 = "amol";
  // let encryptedTest1 = crypto.publicEncrypt(publicKey, Buffer.from(test1));
  // console.log("encryptedTest1 => ", encryptedTest1.toString("base64"));
  // let decryptTest1 = crypto.privateDecrypt(privateKey, encryptedTest1);
  // console.log("decryptTest1 => ", decryptTest1.toString());
  // if (test1 === decryptTest1) {
  //   console.log("decryptTest1 is same as test1", decryptTest1, " === ", test1);
  // }

  //Encrypyed Name, email and Mobile using assymetric key
  const encryptedName = crypto.publicEncrypt(publicKey, Buffer.from(name));
  const encryptedEmail = crypto.publicEncrypt(publicKey, Buffer.from(email));
  const encryptedMobile = crypto.publicEncrypt(publicKey, Buffer.from(mobile));

  //hashing password using bcrypt
  const hashedPassword = bcrypt.hashSync(password);

  const user = new User({
    name,
    email,
    mobile,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch (err) {
    return console.log("Signup error while saving  => ", err);
  }

  return res.status(201).json({ user });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }

  if (!existingUser) {
    return res
      .status(404)
      .json({ message: "User could not be found by this email" });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect Password" });
  }

  // Generate a token
  const token = jwt.sign(
    {
      id: existingUser._id,
      name: existingUser.name,
      email: email,
      mobile: existingUser.mobile,
    },
    process.env.SECRET_KEY,
    { expiresIn: "12h" }
  );

  return res.status(200).json({ message: "Login Successful", token: token });
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res, next) => {
  const { name, email, mobile } = req.body;
  const userID = req.params.id;
  let user;
  try {
    user = await User.findByIdAndUpdate(userID, {
      name,
      email,
      mobile,
    });
  } catch (err) {
    return console.log("Error in updating the user : ", err);
  }

  if (!user) {
    return res.status(500).json({ message: "User doesn't exist" });
  }

  return res.status(200).json({ user });
};
