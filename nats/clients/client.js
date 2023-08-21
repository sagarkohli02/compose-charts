import { connect, StringCodec, JSONCodec, Empty, consumerOpts } from "nats";
import { expiries } from "../utils/expiries.js"

const nc = await connect({ servers: "localhost:30222" });
const jsm = await nc.jetstreamManager();
// jetstream client
const js = nc.jetstream();
const jc = JSONCodec();

await jsm.streams.add({ name: "a", subjects: ["a.*"] });

// to publish messages to a stream:
await js.publish("a.b", jc.encode(JSON.stringify(expiries)));
// await js.publish("a.b", Empty, { msgID: "a" });
let pa = await js.publish("a.b", Empty, { msgID: "a" });
// the jetstream returns an acknowledgement with the
// stream that captured the message, it's assigned sequence
// and whether the message is a duplicate.
const stream = pa.stream;
const seq = pa.seq;
const duplicate = pa.duplicate;
console.log("sagar")

// list all consumers for a stream:
// const consumers = await jsm.consumers.list("a").next();
// consumers.forEach((ci) => {
//   console.log(ci);
// });

// const opts = consumerOpts();
// opts.queue("q");
// opts.durable("n");
// // opts.deliverTo("here");
// opts.callback((_err, m) => {
//   if (m) {
//     console.log(m)
//     m.ack();
//   }
// });

// const sub = await js.subscribe("foo", opts);
// console.log("hello")
// const sub2 = await js.subscribe("sample-stream.foo", opts);