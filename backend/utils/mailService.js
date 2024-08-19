import nodeMailer from "nodemailer";
import { SMTP_MAIL,SMTP_PASSWORD,SMTP_SERVICE } from "../config/serverConfig.js";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    service: SMTP_SERVICE,
    auth: {
      user:SMTP_MAIL,
      pass:SMTP_PASSWORD,
    },
  });

  const options = {
    from: SMTP_MAIL,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(options);
};