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

  const timer = sleepNotAllowed({
    url: "http://localhost:3000",
    interval: 2000,
  });

  fetch("http://localhost:3000")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      console.log("Test server responded successfully");
    })
    .then(() => {
      clearInterval(timer);
      server.close();
    })
    .catch((error) => {
      console.error(error);
      clearInterval(timer);
      server.close(() => {
        process.exitCode = 1;
      });
    });
});
