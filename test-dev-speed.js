#!/usr/bin/env node

/**
 * Script để test tốc độ khởi động dev server
 * Chạy: node test-dev-speed.js
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

const startTime = performance.now();
let serverReady = false;
let serverOutput = '';

console.log('🚀 Starting dev server...\n');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Capture output
server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  process.stdout.write(output);

  // Check for server ready signals
  if (
    output.includes('serving on') ||
    output.includes('Local:') ||
    output.includes('ready in') ||
    output.includes('VITE') ||
    output.includes('http://')
  ) {
    if (!serverReady) {
      serverReady = true;
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ Server ready in ${elapsed}s\n`);
      
      // Kill server after 2 seconds
      setTimeout(() => {
        console.log('\n🛑 Stopping server...');
        server.kill();
        process.exit(0);
      }, 2000);
    }
  }
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  process.stderr.write(output);
});

// Timeout after 90 seconds
setTimeout(() => {
  if (!serverReady) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ Server did not start within 90s (elapsed: ${elapsed}s)\n`);
    console.log('Last output:');
    console.log(serverOutput.slice(-500));
    server.kill();
    process.exit(1);
  }
}, 90000);

server.on('exit', (code) => {
  if (!serverReady && code !== 0) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ Server exited with code ${code} after ${elapsed}s\n`);
    process.exit(1);
  }
});
