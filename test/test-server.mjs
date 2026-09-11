import { createServer } from "node:http";
import { sleepNotAllowed } from "../dist/index.js";

const server = createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      status: "alive",
    })
  );
});

server.listen(3000, () => {
  console.log("Test server running");

  sleepNotAllowed({
    url: "http://localhost:3000",
    interval: 2000,
  });
});
