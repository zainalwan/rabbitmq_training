const amqp = require('amqplib');

/**
 * Get the number that expected to be a index to get the value of fibonacci. If
 * there is no command line argument for the number, return 5 instead.
 *
 * @param {String[]} argv - The command line argument values
 * @return {Number} The n (number) that expected as fibonacci index
 */
const getNFibonacci = argv => {
    return argv[2] || 5;
}

/**
 * Generate the unique ID for indicating the request and response pair.
 *
 * @return {String} The generated UUID
 */
const generateUuid = () => {
    return Math.random().toString() + Math.random().toString() + Math.random()
        .toString();
}

/**
 * Process the received message and check the similarity of correlationId.
 *
 * @param {String} correlationId - The correlationId that used for sending the
 *                                 request
 * @param {Object} message - The received message from the server
 */
const processMessage = (correlationId, message) => {
    if (message.properties.correlationId == correlationId) {
        console.log(` [.] Got ${message.content.toString()}`);
    }
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let request_queue = 'request_queue';
    let correlationId = generateUuid();
    let message = getNFibonacci(process.argv).toString();

    let response_queue = await channel.assertQueue('', {
        exclusive: true
    });

    await channel.consume(response_queue.queue, message => {
        processMessage(correlationId, message);
    }, {
        noAck: true
    });

    console.log(` [x] Requesting fibonacci of ${message}`);
    channel.sendToQueue(request_queue, Buffer.from(message), {
        correlationId: correlationId,
        replyTo: response_queue.queue
    });

    setTimeout(async () => {
        await connection.close();
        process.exit(0);
    }, 500);
})();
