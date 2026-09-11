export async function request(url: string, timeout: number): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
