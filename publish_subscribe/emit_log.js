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
    let exchange = 'logs';
    let message = getMessage(process.argv);

    await channel.assertExchange(exchange, 'fanout', {
        durable: false
    });

    channel.publish(exchange, '', Buffer.from(message));
    console.log(` [x] Sent ${message}`);

    setTimeout(async () => {
        await connection.close();
        process.exit(0);
    }, 500);
})();
