#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const THRESHOLD_KB = 500;

const analyzePath = path.resolve('apps/app/.next/analyze/client.html');

if (!fs.existsSync(analyzePath)) {
  console.error(`Bundle analysis file not found at ${analyzePath}. Run 'pnpm --filter app analyze' first.`);
  process.exit(1);
}

const sizeKb = fs.statSync(analyzePath).size / 1024;

if (sizeKb > THRESHOLD_KB) {
  console.error(`Bundle size exceeds ${THRESHOLD_KB}KB: ${sizeKb.toFixed(2)}KB`);
  process.exit(1);
}

console.log(`Bundle size OK: ${sizeKb.toFixed(2)}KB (threshold ${THRESHOLD_KB}KB)`);
