const amqp = require('amqplib');

/**
 * Get the message for given command line argument. The message is joined from
 * third argument until the rest with spaces. If there is no third argument,
 * return 'Hi, there!' as the message.
 *
 * @param {String[]} argv - the command line argument values
 * @return {String} the concated message
 */
const getMessage = argv => {
    return argv.slice(2).join(' ') || 'Hi, there!';
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let queue = 'work_queue';
    let message = getMessage(process.argv);

    await channel.assertQueue(queue, {
        // Set durable to true so if the RabbitMQ stops, the queue still remain
        durable: true
    });

    channel.sendToQueue(queue, Buffer.from(message), {
        // Set persistent to true so if the RabbitMQ stops, the message still
        // remain
        persistent: true
    });
    console.log(` [x] Sent ${message}`);

    setTimeout(async () => {
        await connection.close();
        process.exit(0);
    }, 500);
})();
