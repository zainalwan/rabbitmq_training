const amqp = require('amqplib/callback_api');

/**
 * The callback that used for handle the creation of a channel
 * @param       errorChannel    the error of channel creation
 * @param       channel         the channel that succesfully created
 */
const channelCallback = (errorChannel, channel) => {
    if (errorChannel) {
        throw errorChannel;
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
 * @param       errorConnection the error of connection creation
 * @param       connection      the connection that succesfully created
 */
const connectionCallback = (errorConnection, connection) => {
    if (errorConnection) {
        throw errorConnection;
    }

    connection.createChannel(channelCallback);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

amqp.connect('amqp://localhost', connectionCallback);
