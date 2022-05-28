const amqp = require('amqplib');

/**
 * Process the supplied message. It just used to display the message to the
 * console.
 *
 * @param {Object} message - The supplied message
 */
const processMessage = message => {
    console.log(` [x] Received ${message.content.toString()}`);
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let queue = 'greeting';

    await channel.assertQueue(queue, {
        durable: false
    });

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    await channel.consume(queue, processMessage, {
        noAck: true
    });
})();
