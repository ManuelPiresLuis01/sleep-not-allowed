# SLEEP-NOT-ALLOWED

[![npm version](https://img.shields.io/npm/v/sleep-not-allowed)](https://www.npmjs.com/package/sleep-not-allowed)
[![npm downloads](https://img.shields.io/npm/dt/sleep-not-allowed)](https://www.npmjs.com/package/sleep-not-allowed)
[![license](https://img.shields.io/npm/l/sleep-not-allowed)](https://github.com/ManuelPiresLuis01/sleep-not-allowed)

Keep a server deployment active with periodic HTTP health-check requests to a URL.

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

## Why sleep-not-allowed?

Some hosting platforms suspend or scale down services that receive no traffic for a period of time. For example:

| Platform                                                                                  | Inactivity behavior                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Render Free web service](https://render.com/docs/free#spinning-down-on-idle)             | Spins down after 15 minutes without inbound traffic                                                                                 |
| [Koyeb Free Instance](https://www.koyeb.com/docs/run-and-scale/scale-to-zero#idle-period) | Scales to zero after 1 hour without traffic                                                                                         |
| [Railway Free](https://docs.railway.com/reference/pricing/plans)                          | No fixed inactivity timeout is listed in the current plan documentation; usage is subject to the plan's included credits and limits |
| [Heroku Eco Dyno](https://devcenter.heroku.com/articles/dyno-sleeping)                    | Sleeps after 30 minutes of inactivity; Eco is a paid dyno plan, not a free tier                                                     |

`sleep-not-allowed` periodically sends HTTP requests to your application so that it continues receiving traffic while the scheduler is running.

> **Note:** Platform policies, pricing, and free-tier limitations may change over time. Always check your hosting provider's current documentation. The values above were checked in September 2026.

The package does not host an application or provide a health-check endpoint. It calls the URL that you configure.

## Features

- Periodic HTTP `GET` requests to a configured URL
- An immediate request when the scheduler starts
- Configurable request interval
- Configurable request timeout
- Configurable retries for failed requests
- Console logging for startup, successful requests, and failed requests
- TypeScript types included in the published package

## Installation

```bash
npm install sleep-not-allowed
```

The package currently documents npm installation only.

## Quick Start

```js
import { sleepNotAllowed } from "sleep-not-allowed";

sleepNotAllowed({
  url: "https://your-app.example.com/health",
  interval: 5 * 60 * 1000,
});
```

Calling `sleepNotAllowed` starts the scheduler. It sends the first request immediately and then repeats it every five minutes.

## Usage

### Import the package

The package is published as an ES module and exposes `sleepNotAllowed` from its root entry point:

```js
import { sleepNotAllowed } from "sleep-not-allowed";
```

### Start the scheduler

Pass an options object with a target URL and interval in milliseconds:

```js
const timer = sleepNotAllowed({
  url: "https://your-app.example.com/health",
  interval: 60_000,
});
```

The function starts the first health check immediately. It then schedules another check after each interval.

### Options

| Option     | Type     | Required | Default | Description                                                                                                |
| ---------- | -------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `url`      | `string` | Yes      | -       | URL that receives the periodic HTTP `GET` request.                                                         |
| `interval` | `number` | Yes      | -       | Time between scheduled checks, in milliseconds.                                                            |
| `timeout`  | `number` | No       | `10000` | Maximum request time, in milliseconds. The request is aborted when this time is exceeded.                  |
| `retries`  | `number` | No       | `0`     | Number of additional attempts after a failed request. Retries happen immediately during the current check. |

For example:

```js
import { sleepNotAllowed } from "sleep-not-allowed";

sleepNotAllowed({
  url: "https://your-app.example.com/health",
  interval: 60_000,
  timeout: 5_000,
  retries: 2,
});
```

This configuration makes one request immediately and then runs the scheduler every 60 seconds. Each request has a five-second timeout. If a request fails, the package makes up to two additional attempts before logging the failure.

### Stop the scheduler

`sleepNotAllowed` returns the timer created by `setInterval`. You can pass that value to `clearInterval` when the scheduler should stop:

```js
const timer = sleepNotAllowed({
  url: "https://your-app.example.com/health",
  interval: 60_000,
});

clearInterval(timer);
```

There is no separate stop method in the public API.

## How it works

```text
Application
    |
    v
sleep-not-allowed
    |
    v
Periodic HTTP GET request
    |
    v
User's server
```

When `sleepNotAllowed` is called:

1. The package logs the configured settings.
2. It sends a `GET` request immediately.
3. It schedules the same operation with `setInterval` using the configured `interval`.
4. Each request uses the configured `timeout`, or `10000` milliseconds by default.
5. If a request fails, the package retries it immediately until the configured number of retries is exhausted.
6. If all attempts fail, the failure is logged and the scheduler continues with the next scheduled interval.

A response is considered successful when its HTTP status is in the `2xx` range accepted by `fetch` through `response.ok`.

## Example

The following example starts a scheduler for an existing application health endpoint:

```js
import { sleepNotAllowed } from "sleep-not-allowed";

const scheduler = sleepNotAllowed({
  url: "https://api.example.com/health",
  interval: 2 * 60 * 1000,
  timeout: 10_000,
  retries: 1,
});

// Stop the periodic requests when they are no longer needed.
// clearInterval(scheduler);
```

The URL must point to a server that can receive the request. The package does not create or expose the `/health` endpoint.

## Configuration

Configuration is passed directly to `sleepNotAllowed` through the `SleepNotAllowedOptions` object:

```ts
interface SleepNotAllowedOptions {
  url: string;
  interval: number;
  timeout?: number;
  retries?: number;
}
```

`interval`, `timeout`, and the timer values are expressed in milliseconds. The implementation does not define additional configuration files or environment variables.

## API Reference

### `sleepNotAllowed(options)`

Starts periodic health-check requests.

**Parameters**

- `options: SleepNotAllowedOptions` - Scheduler configuration.
  - `url: string` - Target URL for the HTTP `GET` request.
  - `interval: number` - Interval between requests, in milliseconds.
  - `timeout?: number` - Request timeout, in milliseconds. Defaults to `10000`.
  - `retries?: number` - Additional immediate attempts after a failure. Defaults to `0`.

**Returns**

`NodeJS.Timeout` - The interval timer created by the scheduler. Use it with `clearInterval` to stop future scheduled requests.

**Example**

```js
import { sleepNotAllowed } from "sleep-not-allowed";

const timer = sleepNotAllowed({
  url: "https://example.com/health",
  interval: 30_000,
  timeout: 10_000,
  retries: 2,
});

// Later:
clearInterval(timer);
```

### `SleepNotAllowedOptions`

The package also exports `SleepNotAllowedOptions` as a TypeScript type:

```ts
import type { SleepNotAllowedOptions } from "sleep-not-allowed";
```

## Error Handling

The underlying request uses `fetch` with an `AbortController`.

- If the response is not successful (`response.ok` is `false`), the request fails with an error containing the HTTP status, such as `Health check failed with status 503`.
- If the timeout is exceeded, the request is aborted.
- Network and other request errors are caught by the scheduler.
- The scheduler retries failed requests according to `retries`.
- After all attempts fail, the package logs the URL and error with `console.error`.
- A failed check does not stop the scheduler; the next scheduled check still runs.

## Development

Clone the repository and install its dependencies:

```bash
git clone https://github.com/ManuelPiresLuis01/sleep-not-allowed.git
cd sleep-not-allowed
npm install
```

Available npm scripts:

| Command                  | Description                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `npm run build`          | Compile the TypeScript source into `dist/`, including declarations and source maps. |
| `npm test`               | Run the automated Node.js test suite.                                               |
| `npm run format`         | Format source, tests, and root JSON files with Prettier.                            |
| `npm run format:check`   | Check formatting without changing files.                                            |
| `npm run prepublishOnly` | Run the build before publishing.                                                    |

For a local development cycle:

```bash
npm run format:check
npm run build
npm test
```

## Contributing

1. Fork the repository.
2. Clone your fork.
3. Create a branch for your changes.
4. Make your changes.
5. Run `npm run format:check`, `npm run build`, and `npm test`.
6. Create a Pull Request against the repository.

## License

The package metadata declares the [ISC License](https://opensource.org/license/isc-license-txt). A separate `LICENSE` file is not currently included in the repository.
