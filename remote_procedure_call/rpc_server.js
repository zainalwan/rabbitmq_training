const amqp = require('amqplib');

/**
 * Get the value of fibonacci numbers with the order number n.
 *
 * @param {Number} n - The order of fibonacci numbers
 */
const fibonacci = n => {
    let continousValues = [0, 1];

    if (n < 0) {
        throw 'The n should be a positive number.';
    }

    if (n < 2) {
        return continousValues[n];
    }

    for (let i = 2; i <= n; i++) {
        continousValues.push(continousValues[0] + continousValues[1]);
        continousValues.shift();
    }

    return continousValues[continousValues.length - 1];
}

/**
 * Reply the request based on the given message. The exptected message is a
 * number and we will return the fibonacci value with the order of the number.
 *
 * @param {Object} channel - The channel that receive the emssage
 * @param {Object} message - The received message
 */
const reply = (channel, message) => {
    let nFibonacci = Number(message.content.toString());

    console.log(` [x] Receved ${nFibonacci}`);

    let fibonacciValue = fibonacci(nFibonacci);

    channel.sendToQueue(message.properties.replyTo,
        Buffer.from(fibonacciValue.toString()), {
            correlationId: message.properties.correlationId
        });

    channel.ack(message);
}

/**
 * This is an immediately invoked function expression to be used as async
 * function because of we need to use 'await' keyword
 */
(async () => {
    let connection = await amqp.connect('amqp://localhost');
    let channel = await connection.createChannel();
    let request_queue = 'request_queue';

    await channel.assertQueue(request_queue, {
        durable: false
    });

    channel.prefetch(1);

    console.log(' [x] Waiting for RPC requests.');
    await channel.consume(request_queue, message => {
        reply(channel, message);
    }, {
        noAck: false
    });
})();
