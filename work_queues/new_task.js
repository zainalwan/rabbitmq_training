const amqp = require('amqplib/callback_api');

/**
 * Get the message for given command line argument
 * @param       argv    the command line argument values
 * @return              the message
 */
const getMessage = argv => {
    return argv.slice(2).join(' ') || 'Hi, there!';
}

/**
 * The callback that used for handle the creation of a channel
 * @param       error           the error of channel creation
 * @param       channel         the channel that succesfully created
 */
const channelCallback = (error, channel) => {
    if (error) {
        throw error;
    }

    let queue = 'task_queue';
    let message = getMessage(process.argv);

    channel.assertQueue(queue, {
        // Set durable to true so if the RabbitMQ stops, the queue still remain
        durable: true
    });

    channel.sendToQueue(queue, Buffer.from(message), {
        // Set persistent to true so if the RabbitMQ stops, the message still
        // remain
        persistent: true
    });
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
