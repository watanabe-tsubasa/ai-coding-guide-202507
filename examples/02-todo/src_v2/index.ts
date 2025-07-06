#!/usr/bin/env node

import { TodoCLI } from './cli.js';

const cli = new TodoCLI();

cli.run(process.argv.slice(2))
  .then(() => cli.close())
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });