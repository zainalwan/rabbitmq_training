const amqp = require('amqplib');

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let queue = 'greeting';
    let message = 'Hi, there!';

    await channel.assertQueue(queue, {
        durable: false
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(` [x] Sent ${message}`);

    setTimeout(async () => {
        await connection.close();
        process.exit(0);
    }, 500);
})();
