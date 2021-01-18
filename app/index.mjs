import http from "http";
import ws from "websocket";
import kafkajs from "kafkajs";

const APPID = process.env.APPID;

//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer();

const WebSocketServer = ws.server;

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res
const websocket = new WebSocketServer({
  httpServer: httpserver,
});

httpserver.listen(8080, () =>
  console.log("My server is listening on port 8080")
);

const topic = "test-topic";

const { Kafka } = kafkajs;

const kafka = new Kafka({
  clientId: "my-wsapp",
  brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
  retry: {
    retries: 20,
  },
});

const producer = kafka.producer();
producer.connect();

const consumer = kafka.consumer({ groupId: `test-group:${APPID}` });
consumer.connect();
consumer.subscribe({ topic, fromBeginning: true });
consumer.run({
  eachMessage: async ({ partition, message }) => {
    const prefix = `[${partition}|${message.offset}]/${message.timestamp}`;
    connections.forEach((c) => c.send(`${APPID} ${prefix}-${message.value}`));
  },
});

let connections = [];

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it!
websocket.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("OPENED!!!"));
  connection.on("close", () => console.log("CLOSED!!!"));
  connection.on("message", (message) => {
    const value = message.utf8Data;
    console.log(`${APPID} Received message ${value}`);
    producer.send({
      topic,
      messages: [{ value }],
    });
  });

  setTimeout(
    () => connection.send(`Connected successfully to server ${APPID}`),
    5000
  );
  connections.push(connection);
});
