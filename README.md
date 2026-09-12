# SLEEP-NOT-ALLOWED

[![npm version](https://img.shields.io/npm/v/sleep-not-allowed)](https://www.npmjs.com/package/sleep-not-allowed)
[![npm downloads](https://img.shields.io/npm/dt/sleep-not-allowed)](https://www.npmjs.com/package/sleep-not-allowed)
[![license](https://img.shields.io/npm/l/sleep-not-allowed)](LICENSE)

A Node.js package for APIs and backends that need periodic HTTP requests to prevent applications hosted on services with sleep or inactivity policies from going idle.

`sleep-not-allowed` runs in a Node.js environment, but the target API can be built with any language or stack that exposes an HTTP endpoint. The package does not create or host the API or its health-check endpoint; it only calls the URL you configure.

## Why use sleep-not-allowed?

Some hosting platforms suspend or scale down applications that receive no traffic for a period of time. `sleep-not-allowed` sends periodic requests to an existing health endpoint so your API continues receiving traffic while the scheduler is running.

The following examples show inactivity behavior documented by some hosting providers:

| Platform                                                                                  | Inactivity behavior                                                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [Render Free web service](https://render.com/docs/free#spinning-down-on-idle)             | Spins down after 15 minutes without inbound traffic.                                                                      |
| [Koyeb Free Instance](https://www.koyeb.com/docs/run-and-scale/scale-to-zero#idle-period) | Scales to zero after 1 hour without traffic.                                                                              |
| [Railway Free](https://docs.railway.com/reference/pricing/plans)                          | No fixed inactivity timeout is listed in the current plan documentation; usage is subject to included credits and limits. |
| [Heroku Eco Dyno](https://devcenter.heroku.com/articles/dyno-sleeping)                    | Sleeps after 30 minutes of inactivity. Eco is a paid dyno plan, not a free tier.                                          |

These values and policies may change. Always check your hosting provider's current documentation.

## How it works

When `sleepNotAllowed` is called, the package:

1. Sends an HTTP `GET` request immediately to the configured URL.
2. Repeats the request at the configured interval.
3. Aborts each request when its timeout is reached.
4. Retries failed requests according to `retries`.

A response is successful when `response.ok` is `true`. If all attempts fail, the error is logged and the scheduler continues with the next interval.

## Installation

```bash
npm install sleep-not-allowed
```

## Usage

### Basic usage

```js
import { sleepNotAllowed } from "sleep-not-allowed";

sleepNotAllowed({
  url: "https://your-api.example.com/health",
  interval: 5 * 60 * 1000,
});
```

The first request is sent immediately, followed by one request every five minutes.

### Complete configuration

```js
import { sleepNotAllowed } from "sleep-not-allowed";

const timer = sleepNotAllowed({
  url: "https://api.example.com/health",
  interval: 60_000,
  timeout: 5_000,
  retries: 2,
});

// Stop future scheduled requests when needed.
clearInterval(timer);
```

### Start it when a Node.js API starts listening

The package can be initialized inside the `listen` callback so the scheduler starts after the API is ready to receive requests:

```js
import { createServer } from "node:http";
import { sleepNotAllowed } from "sleep-not-allowed";

const port = Number(process.env.PORT) || 3000;
const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  response.writeHead(404);
  response.end();
});

server.listen(port, () => {
  sleepNotAllowed({
    url: "https://your-public-api.example.com/health",
    interval: 5 * 60 * 1000,
  });

  console.log(`API listening on port ${port}`);
});
```

Use the deployed public URL when the goal is to generate inbound traffic for a hosted API. The target URL must point to an endpoint that already exists.

### TypeScript

The package exports the `SleepNotAllowedOptions` type:

```ts
import { sleepNotAllowed } from "sleep-not-allowed";
import type { SleepNotAllowedOptions } from "sleep-not-allowed";

const options: SleepNotAllowedOptions = {
  url: "https://api.example.com/health",
  interval: 60_000,
};

sleepNotAllowed(options);
```

## 🌐 Languages and technologies

The technologies below are examples of languages and runtimes that can be used to build the **target API**. They are not languages supported by or required for the package. `sleep-not-allowed` is installed and executed with Node.js, while the API it calls can use any stack with an HTTP endpoint.

<p>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000000" alt="JavaScript" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=ffffff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=ffffff" alt="Python" />
  <img src="https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=ffffff" alt="Java" />
  <img src="https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=ffffff" alt="PHP" />
  <img src="https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=ffffff" alt="Go" />
  <img src="https://img.shields.io/badge/Ruby-CC342D?logo=ruby&logoColor=ffffff" alt="Ruby" />
  <img src="https://img.shields.io/badge/C%23-512BD4?logo=csharp&logoColor=ffffff" alt="C sharp" />
  <img src="https://img.shields.io/badge/Kotlin-7F52FF?logo=kotlin&logoColor=ffffff" alt="Kotlin" />
  <img src="https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=ffffff" alt="Rust" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=ffffff" alt="Node.js" />
</p>

## 💡 Use cases

- Keep an API hosted on Render active during periods without traffic.
- Send periodic requests to an API hosted on Railway.
- Help APIs on free hosting services avoid inactivity-based suspension.
- Keep a private or self-hosted API receiving regular health-check requests.
- Monitor a health endpoint while a deployment is running.

Sleep behavior, limits, and hosting policies vary by provider. Always check the current documentation for the platform you use.

## Configuration

```ts
interface SleepNotAllowedOptions {
  url: string;
  interval: number;
  timeout?: number;
  retries?: number;
}
```

| Option     | Type     | Required | Default | Description                                 |
| ---------- | -------- | -------- | ------- | ------------------------------------------- |
| `url`      | `string` | Yes      | -       | URL that receives the HTTP `GET` request.   |
| `interval` | `number` | Yes      | -       | Time between requests, in milliseconds.     |
| `timeout`  | `number` | No       | `10000` | Maximum request time, in milliseconds.      |
| `retries`  | `number` | No       | `0`     | Additional attempts after a failed request. |

The function returns the `setInterval` timer. Pass it to `clearInterval` to stop future scheduled requests. A failed check does not stop the scheduler.

## Development

```bash
git clone https://github.com/ManuelPiresLuis01/sleep-not-allowed.git
cd sleep-not-allowed
npm install
npm run build
npm test
```

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://www.manuelpiresluis.site">
        <img src="https://www.manuelpiresluis.site/assets/foto-perfil-B3C4QR9r.jpg" width="120" height="120" alt="Manuel Pires Luís" style="border-radius: 50%; object-fit: cover;" />
        <br />
        <sub><b><a href="https://github.com/ManuelPiresLuis01/">Manuel Pires Luís</a></b></sub>
      </a>
      <br />
      Software Engineer &amp; QA
    </td>
  </tr>
</table>

## License

Distributed under the [MIT License](LICENSE).
