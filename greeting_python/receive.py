import pika, sys, os

def process_message(ch, method, properties, body):
    """
    Process the received message
    """
    print(' [X] Received', body)

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
queue = 'greeting'

channel.queue_declare(queue=queue)
channel.basic_consume(queue=queue, auto_ack=True,
    on_message_callback=process_message)

print(f' [*] Waiting for messages in {queue}. To exit press CTRL+C')
channel.start_consuming()
