const amqp = require('amqplib');

/**
 * Process the supplied message. It just used to display the message to the
 * console.
 *
 * @param {Object} message - The supplied message
 */
const processMessage = message => {
    console.log(` [x] Received ${message.fields.routingKey}:`,
        message.content.toString());
}

/**
 * Get the keys for the message that will be received. It is taken from
 * command line argument from index number 2 to the rest. If the supplied
 * command line argument doesn't seem to has any keys, return the
 * 'anonymous.info' severity inside an array
 *
 * @param {String[]} argv - The command line argument
 * @return {String[]} The topic key(s)
 */
const getKeys = argv => {
    let keys = argv.slice(2);
    return keys.length > 0 ? keys : ['anonymous.info'];
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let keys = getKeys(process.argv);
    let exchange = 'topic_logs';

    await channel.assertExchange(exchange, 'topic', {
        durable: false
    });

    let queue = await channel.assertQueue('', {
        exclusive: true
    });

    console.log(` [*] Waiting for logs. To exit press CTRL+C`);
    for (const key of keys) {
        await channel.bindQueue(queue.queue, exchange, key);
    }
    await channel.consume(queue.queue, processMessage, {
        noAck: true
    });
})();
