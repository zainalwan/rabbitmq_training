const amqp = require('amqplib/callback_api');

/**
 * The callback that used for handle the creation of a channel
 * @param       error           the error of channel creation
 * @param       channel         the channel that succesfully created
 */
const channelCallback = (error, channel) => {
    if (error) {
        throw error;
    }

    let queue = 'greeting';
    let message = 'Hi, there!';

    channel.assertQueue(queue, {
        durable: false
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(' [x] Sent %s', message);
}

/**
 * The callback that used for handle the creation of a connection
 * @param       error           the error of connection creation
 * @param       connection      the connection that succesfully created
 */
const connectionCallback = (error, connection) => {
    if (error) {
        throw error;
    }

    connection.createChannel(channelCallback);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

amqp.connect('amqp://localhost', connectionCallback);
