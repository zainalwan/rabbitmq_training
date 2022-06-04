import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
queue = 'greeting'
message = 'Hi, there!'

channel.queue_declare(queue=queue)
channel.basic_publish(exchange='', routing_key=queue, body=message)
print(' [X] Sent', message)
connection.close()
