import app from "./app.js";
import {CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, PORT} from "./config/serverConfig.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name:CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET
});

app.listen(PORT,()=>{
    console.log(`Server listening at port ${PORT}`);
});
