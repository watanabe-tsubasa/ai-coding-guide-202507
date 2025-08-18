#!/usr/bin/env node
import { runCliApp } from './cli';

// Run the CLI application with command-line arguments
await runCliApp(process.argv.slice(2));
