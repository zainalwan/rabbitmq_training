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
    let exchange = 'logs';

    await channel.assertExchange(exchange, 'fanout', {
        durable: false
    });

    let queue = await channel.assertQueue('', {
        exclusive: true
    });

    console.log(` [*] Waiting for messages in ${queue.queue}. To exit press`,
        'CTRL+C');
    await channel.bindQueue(queue.queue, exchange, '');
    await channel.consume(queue.queue, processMessage, {
        noAck: true
    });
})();
