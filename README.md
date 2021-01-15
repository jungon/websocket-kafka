## Getting Started

### Build websocket server docker image
```
docker build -t wsapp .
```

### Run Containers
```
docker-compose up -d
```

### Producer test
```
docker exec -ti {kafka-container-id} /bin/bash
cd /opt/kafka/bin
./kafka-console-producer.sh --broker-list localhost:9092 --topic test-topic
```

### Consumer test
```
docker exec -ti {kafka-container-id} /bin/bash
cd /opt/kafka/bin
./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
```

## Client
open chrome inspect

```
let ws = new WebSocket("ws://localhost:8080");
ws.onmessage = message => console.log(`Received: ${message.data}`);
ws.send("Hello! I'm client")
```
