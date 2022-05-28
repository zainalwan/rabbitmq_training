const amqp = require('amqplib');

/**
 * Get the message for given command line argument. The message is joined from
 * third argument until the rest with spaces. If there is no third argument,
 * return 'Hi, there!' as the message.
 *
 * @param {String[]} argv - The command line argument values
 * @return {String} The concated message
 */
const getMessage = argv => {
    return argv.slice(3).join(' ') || 'Hi, there!';
}

/**
 * Get the severity for the message that will be sent. It is taken from command
 * line argument with index number 2. If the supplied command line argument
 * doesn't seem to has severity, return the 'info' severity
 *
 * @param {String[]} argv - The command line argument
 * @return {String} The severity level
 */
const getSeverity = argv => {
    return argv[2] || 'info';
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let exchange = 'direct_logs';
    let severity = getSeverity(process.argv);
    let message = getMessage(process.argv);

    await channel.assertExchange(exchange, 'direct', {
        durable: false
    });

    channel.publish(exchange, severity, Buffer.from(message));
    console.log(` [x] Sent ${severity}: ${message}`);

    setTimeout(async () => {
        await connection.close();
        process.exit(0);
    }, 500);
})();
