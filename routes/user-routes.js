import express from "express";
import {
  signup,
  getAllUsers,
  login,
  resetPassword,
  updateUser,
} from "../controllers/user-controller";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/reset", resetPassword);
router.patch("/update/:id", updateUser);

export default router;
