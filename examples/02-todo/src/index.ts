#!/usr/bin/env node

import { TodoCLI } from './cli.js';

const cli = new TodoCLI();

// Remove the first two elements (node and script path)
const args = process.argv.slice(2);

// Show help if no arguments
if (args.length === 0) {
  args.push('help');
}

// Run the CLI
cli.run(args).finally(() => {
  cli.close();
});