#!/usr/bin/env node

/**
 * Launcher for Git-Hub-Page-Game
 * Handles the externalfile:// protocol and opens the game in the default browser
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the protocol URL from command line arguments
const protocolUrl = process.argv[2] || '';

// Log for debugging
console.log('Launcher started with:', protocolUrl);

// Get the absolute path to index.html
const gameDir = __dirname;
const indexPath = path.join(gameDir, 'index.html');

// Verify the game file exists
if (!fs.existsSync(indexPath)) {
  console.error('Error: index.html not found at', indexPath);
  process.exit(1);
}

// Convert to file:// URL
const fileUrl = `file:///${indexPath.replace(/\\/g, '/')}`;

console.log('Opening game at:', fileUrl);

// Detect platform and open browser accordingly
const platform = process.platform;

let command, args;

if (platform === 'win32') {
  // Windows
  command = 'cmd';
  args = ['/c', 'start', '', fileUrl];
} else if (platform === 'darwin') {
  // macOS
  command = 'open';
  args = [fileUrl];
} else {
  // Linux and others
  command = 'xdg-open';
  args = [fileUrl];
}

// Spawn the browser
const browser = spawn(command, args, {
  detached: true,
  stdio: 'ignore'
});

// Unref so the parent process can exit
browser.unref();

console.log('Game launched successfully!');
console.log('You can close this window.');

// Give it a moment to launch, then exit
setTimeout(() => {
  process.exit(0);
}, 1000);
