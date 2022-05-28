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
 * Get the severities for the message that will be received. It is taken from
 * command line argument from index number 2 to the rest. If the supplied
 * command line argument doesn't seem to has severity, return the 'info'
 * severity inside an array
 *
 * @param {String[]} argv - The command line argument
 * @return {String[]} The severity levels
 */
const getSeverities = argv => {
    let severities = argv.slice(2);
    return severities.length > 0 ? severities : ['info'];
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let severities = getSeverities(process.argv);
    let exchange = 'direct_logs';

    await channel.assertExchange(exchange, 'direct', {
        durable: false
    });

    let queue = await channel.assertQueue('', {
        exclusive: true
    });

    console.log(` [*] Waiting for logs. To exit press CTRL+C`);
    for (const severity of severities) {
        await channel.bindQueue(queue.queue, exchange, severity);
    }
    await channel.consume(queue.queue, processMessage, {
        noAck: true
    });
})();
