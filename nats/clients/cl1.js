import { connect, StringCodec, JSONCodec, createInbox, Empty, consumerOpts } from "nats";


const nc = await connect({ servers: "localhost:30222" });
// jetstream client
const js = nc.jetstream();
const jc = JSONCodec();


const opts = consumerOpts();
opts.durable("me");
opts.manualAck();
opts.ackExplicit();
opts.callback((err, m) => {
  // let a = jc.decode(m.data)
  console.log(m)
  // console.log(a)
  m.ack()
})

let sub = await js.subscribe("a.b", opts);
let i = 0
const done = (async () => {
  for await (const m of sub) {
    let a = jc.decode(m.data)
    console.log(m)
    console.log(a)
    m.ack()
    // if(i == 5){
    //   console.log("acknowledging the message" + m)
    //   // m.ack()
    // }
    // console.log("i>>>" + i)
    // m.nak();
    // i++
  }
});
console.log("sgars")

// when done (by some logic not shown here), you can delete
// the consumer by simply calling `destroy()`. Destroying
// a consumer removes all its state information.
// sub.destroy();