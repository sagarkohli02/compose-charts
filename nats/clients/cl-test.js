import { connect } from "nats";
const servers = [
  { servers: "localhost:4223" },
];
await servers.forEach(async (v) => {
  try {
    const nc = await connect(v);
    console.log(`connected to ${nc.getServer()}`);
    // this promise indicates the client closed
    const done = nc.closed().then((err) => {
      if (err) {
        console.error(
          `service ${n} exited because of error: ${err.message}`,
        );
      }
      console.log(`connection closed`)
    });
    // do something with the connection

    // close the connection
    // await nc.close();
    // check if the close was OK
    const err = await done;
    if (err) {
      console.log(`error closing:`, err);
    }
  } catch (err) {
    console.log(`error connecting to ${JSON.stringify(v)}`);
  }
});