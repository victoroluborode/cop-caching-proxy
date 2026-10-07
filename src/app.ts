#!/usr/bin/env node

import { Command } from 'commander';
import { startServer } from './server';
import { cache } from './routes/proxy.routes';

const program = new Command();

program
    .option('-p, --port <number>', 'Port on which caching server runs')
    .option('-o, --origin <url>', 'URL of the server requests are forwarded to')
    .option('-c, --clear-cache', 'Clear the cache')

program.parse(process.argv);

const options = program.opts();

async function run() {
  if (options.clearCache) {
    const port = options.port || 3000;
    try {
      const response = await fetch(`http://localhost:${port}/__clear-cache`, {
        method: "POST",
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error(
        "Failed to clear cache — is the server running on that port?",
      );
    }
    process.exit(0);
  }

  startServer(options);
}

run();
