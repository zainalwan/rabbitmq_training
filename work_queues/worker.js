const amqp = require('amqplib');

/**
 * Process the supplied message. It used to simulate task processing and display
 * the message to the console.
 *
 * @param {Object} channel - The channel that consume the message
 * @param {Object} message - The supplied message
 */
const processMessage = (channel, message) => {
    let seconds = message.content.toString().split('.').length - 1;

    console.log(` [x] Received ${message.content.toString()}`);

    // Simulate processing the task
    setTimeout(() => {
        console.log(' [x] Done');
        // Send acknowledgement signal as the end of the task processing
        channel.ack(message);
    }, seconds * 1000);
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let queue = 'work_queue';

    await channel.assertQueue(queue, {
        durable: true
    });

    // Message dispatch is used to prevent RabbitMQ to send message if this
    // worker still process the message until finished (acknowledgement signal
    // is sent)
    channel.prefetch(1);

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    await channel.consume(queue, message => {
        processMessage(channel, message);
    }, {
        // Tell the RabbitMQ that we will send acknowledgement signal
        noAck: false
    });
})();
