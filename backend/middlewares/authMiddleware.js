import jwt from "jsonwebtoken";
import  User  from "../models/userSchema.js";
import { JWT_SECRET_KEY } from "../config/serverConfig.js";


export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).send({message:"User is not authenticated",success:false});
  }
  const decoded = jwt.verify(token,JWT_SECRET_KEY);

  console.log(decoded);

  req.user = await User.findById(decoded.id);

  next();
};

export const isAuthorized = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).send({message:`${req.user.role} not allowed to access this resource.`,success:false});     
    }

    next();
  };
};