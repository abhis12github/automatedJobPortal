import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import { channel } from './rabbitmq.js';
import { Application } from "../models/applicationSchema.js";

export const newsLetterCron = () => {
  cron.schedule('0 10 * * *', async () => {
    console.log('Running Cron Automation');
    const jobs = await Job.find({ newsLettersSent: false });
    for (const job of jobs) {
      try {
        const filteredUsers = await User.find({
          $or: [
            { 'niches.firstNiche': job.jobNiche },
            { 'niches.secondNiche': job.jobNiche },
            { 'niches.thirdNiche': job.jobNiche },
          ],
        });
        for (const user of filteredUsers) {
          const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
          const message = `Hi ${user.name},\n\nGreat news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon’t wait too long! Job openings like these are filled quickly. \n\nWe’re here to support you in your job search. Best of luck!\n\nBest Regards,\nNicheNest Team`;

          channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify({
            email: user.email,
            subject,
            message
          })), { persistent: true });

          const isAlreadyApplied = await Application.findOne({
            "jobInfo.jobId": job._id,
            "jobSeekerInfo.id": user._id,
          });

          if (user.applyAutomatically && !isAlreadyApplied) {
            channel.sendToQueue('applyQueue', Buffer.from(JSON.stringify({
              jobId: job._id,
              user
            })), { persistent: true });
          }
        }
        job.newsLettersSent = true;
        await job.save();
      } catch (error) {
        console.log('ERROR IN NODE CRON CATCH BLOCK:', error.message);
      }
    }
  });
};
