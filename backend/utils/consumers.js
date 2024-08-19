import { channel } from './rabbitmq.js';
import { applyForJob } from './applyAutomaticallyService.js'; // Make sure to export your applyForJob function
import { sendEmail } from './mailService.js'; // Implement your sendEmail function

const startConsumers = () => {
    channel.consume('emailQueue', async (msg) => {
        if (msg !== null) {
            const { email, subject, message } = JSON.parse(msg.content.toString());
            try {
                await sendEmail({ email, subject, message });
                channel.ack(msg);
            } catch (error) {
                console.error('Failed to send email:', error.message);
            }
        }
    });

    channel.consume('applyQueue', async (msg) => {
        if (msg !== null) {
            const { jobId, user } = JSON.parse(msg.content.toString());
            try {
                await applyForJob({ jobId, user });
                channel.ack(msg);
            } catch (error) {
                console.error('Failed to apply for job:', error.message);
            }
        }
    });
};

export default startConsumers;
