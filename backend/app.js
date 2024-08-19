import express from "express";
import cors from "cors";
import { FRONTEND_URL } from "./config/serverConfig.js";
import cookieParser from "cookie-parser";
import connection from "./db/connection.js";
import fileUpload from "express-fileupload";

import userRouter from "./routes/userRoute.js";
import jobRouter from "./routes/jobRoute.js";
import applicationRouter from "./routes/applicationRoute.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import startConsumers from "./utils/consumers.js";
import { newsLetterCron } from "./utils/mailCron.js";

const app = express();

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

app.use(cookieParser());  // for handling the jsonwebtoken
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({  // for handling file upload
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use("/api/v1/user", userRouter); // configuring user routes
app.use("/api/v1/job", jobRouter); // configuring job routes
app.use("/api/v1/application", applicationRouter); // configuring application routes


// newsLetterCron();  // starting cron jobs
connection(); // connecting to mongodb database.

await connectRabbitMQ();
startConsumers();
newsLetterCron();



export default app;