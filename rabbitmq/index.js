import amqplib from "amqplib";

(async () => {
  const queue = 'tasks';
  const conn = await amqplib.connect('amqp://myuser:mypassword@192.168.122.5');
  const ch1 = await conn.createChannel();
  await ch1.assertQueue(queue);

  // Listener
  ch1.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Recieved:', msg.content.toString());
      ch1.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });

  // // Sender
  // const ch2 = await conn.createChannel();

  // setInterval(() => {
  //   ch2.sendToQueue(queue, Buffer.from('something to do'));
  // }, 1000);
})();