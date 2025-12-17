#!/usr/bin/env node

/**
 * Protocol Registration Helper
 * Helps users register the externalfile:// protocol on their system
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== External File Protocol Registration Helper ===\n');

const platform = process.platform;
const launcherPath = path.join(__dirname, 'launcher.js');
const nodePath = process.execPath;

console.log('Detected Platform:', platform);
console.log('Node.js Path:', nodePath);
console.log('Launcher Path:', launcherPath);
console.log();

if (platform === 'win32') {
  // Windows
  console.log('Windows detected!');
  console.log('\nTo register the protocol on Windows:');
  console.log('1. Double-click the "register-externalfile-protocol.reg" file');
  console.log('2. Click "Yes" when Windows asks for permission');
  console.log('3. The protocol will be registered');
  console.log('\nOr manually edit the .reg file to use the correct paths for your system.');
  
  // Create a personalized .reg file
  const regContent = `Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\\externalfile]
@="URL:External File Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\\externalfile\\shell]

[HKEY_CLASSES_ROOT\\externalfile\\shell\\open]

[HKEY_CLASSES_ROOT\\externalfile\\shell\\open\\command]
@="\\"${nodePath.replace(/\\/g, '\\\\')}\\" \\"${launcherPath.replace(/\\/g, '\\\\')}\\" \\"%1\\""
`;
  
  const regFilePath = path.join(__dirname, 'register-externalfile-protocol-generated.reg');
  fs.writeFileSync(regFilePath, regContent);
  console.log(`\nGenerated personalized registry file: ${regFilePath}`);
  console.log('You can double-click this file to register the protocol!');
  
} else if (platform === 'darwin') {
  // macOS
  console.log('macOS detected!');
  console.log('\nTo register the protocol on macOS:');
  console.log('1. Edit the "externalfile-protocol.plist" file');
  console.log('2. Update the paths to match your Node.js and launcher locations');
  console.log('3. Copy it to ~/Library/LaunchAgents/');
  console.log('4. Run: launchctl load ~/Library/LaunchAgents/externalfile-protocol.plist');
  console.log('\nNote: You may need to create a simple .app bundle for better integration.');
  
} else {
  // Linux
  console.log('Linux detected!');
  console.log('\nTo register the protocol on Linux:');
  console.log('1. Edit the "externalfile-protocol.desktop" file');
  console.log('2. Update the paths to match your Node.js and launcher locations');
  console.log('3. Copy it to ~/.local/share/applications/');
  console.log('4. Run: update-desktop-database ~/.local/share/applications/');
  console.log('5. Run: xdg-mime default externalfile-protocol.desktop x-scheme-handler/externalfile');
  
  // Create a personalized .desktop file
  const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=External File Protocol Handler
Comment=Handle externalfile:// protocol URLs
Exec="${nodePath}" "${launcherPath}" %u
Terminal=false
MimeType=x-scheme-handler/externalfile;
NoDisplay=true
`;
  
  const desktopFilePath = path.join(__dirname, 'externalfile-protocol-generated.desktop');
  fs.writeFileSync(desktopFilePath, desktopContent);
  console.log(`\nGenerated personalized desktop file: ${desktopFilePath}`);
  console.log('Copy this file to ~/.local/share/applications/ and run the commands above!');
}

console.log('\n=== For detailed instructions, see LAUNCHER-SETUP.md ===');
