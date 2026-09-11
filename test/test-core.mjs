import assert from "node:assert/strict";
import test from "node:test";
import { request } from "../dist/core/requester.js";
import { createScheduler } from "../dist/core/scheduler.js";

const originalFetch = globalThis.fetch;

function setFetch(mockFetch) {
  globalThis.fetch = mockFetch;
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test("request resolves for a successful response", async () => {
  let receivedRequest;

  setFetch(async (url, options) => {
    receivedRequest = { url, options };
    return new Response(null, { status: 204 });
  });

  try {
    await request("https://example.com/health", 100);
  } finally {
    restoreFetch();
  }

  assert.equal(receivedRequest.url, "https://example.com/health");
  assert.equal(receivedRequest.options.method, "GET");
});

test("request rejects when the response status is not successful", async () => {
  setFetch(async () => new Response(null, { status: 503 }));

  try {
    await assert.rejects(request("https://example.com/health", 100), {
      message: "Health check failed with status 503",
    });
  } finally {
    restoreFetch();
  }
});

test("request aborts when it exceeds the timeout", async () => {
  setFetch(
    (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
      })
  );

  try {
    await assert.rejects(request("https://example.com/health", 10));
  } finally {
    restoreFetch();
  }
});

test("createScheduler retries a failed request and stops after success", async () => {
  let attempts = 0;
  setFetch(async () => {
    attempts++;
    if (attempts === 1) {
      return new Response(null, { status: 500 });
    }

    return new Response(null, { status: 200 });
  });

  const timer = createScheduler({
    url: "https://example.com/health",
    interval: 60_000,
    retries: 1,
  });

  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(attempts, 2);
  } finally {
    clearInterval(timer);
    restoreFetch();
  }
});

test("createScheduler returns an interval that can be cancelled", async () => {
  let attempts = 0;
  setFetch(async () => {
    attempts++;
    return new Response(null, { status: 200 });
  });

  const timer = createScheduler({
    url: "https://example.com/health",
    interval: 10,
  });

  try {
    await new Promise((resolve) => setImmediate(resolve));
    clearInterval(timer);
    const attemptsBeforeWait = attempts;
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(attempts, attemptsBeforeWait);
  } finally {
    clearInterval(timer);
    restoreFetch();
  }
});
