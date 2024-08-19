import express from "express";
import { register , login ,logout ,updateProfile, updatePassword, getUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router=express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",isAuthenticated,logout);
router.get("/getUser",isAuthenticated,getUser);
router.put("/update/profile",isAuthenticated,updateProfile);
router.put("/update/password",isAuthenticated,updatePassword);

export default router;