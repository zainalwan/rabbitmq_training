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

    channel.assertQueue(queue, {
        durable: false
    });

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C',
        queue);
    channel.consume(queue, message => {
        console.log(' [x] Received %s', message.content.toString());
    }, {
        noAck: true
    });
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
}

amqp.connect('amqp://localhost', connectionCallback);
