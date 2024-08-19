import mongoose from "mongoose";
import { MONGOOSE_URI } from "../config/serverConfig.js";

const connection=async()=>{
    try {
        await mongoose.connect(MONGOOSE_URI);
        console.log('Connected to the database succesfully');
    } catch (error) {
        console.log(`Some error ocuurred while connecting to db ${error}`);
    }
    
}

export default connection;