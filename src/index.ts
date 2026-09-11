import { createScheduler } from "./core/scheduler.js";
import type { SleepNotAllowedOptions } from "./types/index.js";

export function sleepNotAllowed(options: SleepNotAllowedOptions) {
  return createScheduler(options);
}

export type { SleepNotAllowedOptions };
