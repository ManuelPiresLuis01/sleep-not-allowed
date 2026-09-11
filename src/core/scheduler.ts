import { request } from "./requester.js";
import { logger } from "../utils/logger.js";
import type { SleepNotAllowedOptions } from "../types/index.js";

export function createScheduler(
  options: SleepNotAllowedOptions
): NodeJS.Timeout {
  const { url, interval, timeout = 10000, retries = 0 } = options;

  logger.start(url, interval, timeout, retries);

  const execute = async () => {
    let attempts = 0;

    while (attempts <= retries) {
      try {
        await request(url, timeout);

        logger.success(url);

        return;
      } catch (error) {
        attempts++;

        if (attempts > retries) {
          logger.error(url, error);

          return;
        }
      }
    }
  };

  execute();

  return setInterval(execute, interval);
}
