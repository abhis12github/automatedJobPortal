import amqp from 'amqplib';

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    await channel.assertQueue('emailQueue', { durable: true });
    await channel.assertQueue('applyQueue', { durable: true });

    console.log('RabbitMQ connected and channel created');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
  }
};

export { connectRabbitMQ, channel };

