const reset = "\x1b[0m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";
const red = "\x1b[31m";
const gray = "\x1b[90m";
const bold = "\x1b[1m";

const prefix = `${gray}[${reset}${cyan}sleep-not-allowed${reset}${gray}]${reset}`;

export const logger = {
  start(url: string, interval: number, timeout: number, retries: number) {
    console.log("");
    console.log(
      `${cyan}${bold}╔══════════════════════════════════════════════════╗${reset}`
    );
    console.log(
      `${cyan}${bold}║              SLEEP-NOT-ALLOWED                   ║${reset}`
    );
    console.log(
      `${cyan}${bold}╚══════════════════════════════════════════════════╝${reset}`
    );
    console.log("");
    console.log(`${prefix} ${green}✓${reset} Service started`);
    console.log(`${prefix} ${cyan}→${reset} Target: ${url}`);
    console.log(`${prefix} ${cyan}→${reset} Interval: ${interval}ms`);
    console.log(`${prefix} ${cyan}→${reset} Timeout: ${timeout}ms`);
    console.log(`${prefix} ${cyan}→${reset} Retries: ${retries}`);
    console.log(`${prefix} ${green}✓${reset} Keep-alive is active`);
    console.log("");
  },

  success(url: string) {
    console.log(`${prefix} ${green}✓ Ping successful:${reset} ${url}`);
  },

  error(url: string, error: unknown) {
    console.error(`${prefix} ${red}✗ Ping failed:${reset} ${url}`, error);
  },
};
