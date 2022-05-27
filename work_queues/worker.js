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

    let queue = 'task_queue';

    channel.assertQueue(queue, {
        durable: true
    });

    // Message dispatch is used to prevent RabbitMQ to send message if this
    // worker still process the message until finished (acknowledgement signal
    // is sent)
    channel.prefetch(1);

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C',
        queue);
    channel.consume(queue, message => {
        let seconds = message.content.toString().split('.').length - 1;

        console.log(' [x] Received %s', message.content.toString());

        // Simulate processing the task
        setTimeout(() => {
            console.log(' [x] Done');
            // Send acknowledgement signal as the end of the task processing
            channel.ack(message);
        }, seconds * 1000);
    }, {
        noAck: false
    });
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
}

amqp.connect('amqp://localhost', connectionCallback);
