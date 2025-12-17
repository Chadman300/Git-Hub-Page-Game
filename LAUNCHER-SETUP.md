# Launcher Setup Guide

This guide will help you set up the custom `externalfile://` protocol handler so you can launch the game using custom URLs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Platform-Specific Instructions](#platform-specific-instructions)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Testing the Protocol](#testing-the-protocol)
- [Troubleshooting](#troubleshooting)
- [Uninstalling](#uninstalling)

## Prerequisites

Before you begin, make sure you have:

1. **Node.js installed** (version 12 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Git-Hub-Page-Game downloaded**
   - Clone or download this repository to your computer
   - Remember the full path to the game folder

## Quick Setup

The easiest way to register the protocol is to use the helper script:

```bash
cd /path/to/Git-Hub-Page-Game
node register-protocol.js
```

This will:
- Detect your operating system
- Show you the exact steps needed
- Generate personalized configuration files for your system

Then follow the platform-specific instructions below.

## Platform-Specific Instructions

### Windows

#### Method 1: Using the Generated Registry File (Recommended)

1. Run the helper script:
   ```cmd
   node register-protocol.js
   ```

2. This creates `register-externalfile-protocol-generated.reg` with your system's paths

3. Double-click the generated `.reg` file

4. Click **Yes** when Windows asks "Do you want to allow this app to make changes to your device?"

5. Click **OK** when you see "Keys and values have been successfully added to the registry"

#### Method 2: Manual Registry Edit

1. Open `register-externalfile-protocol.reg` in a text editor

2. Replace the placeholder paths:
   - Replace `C:\Program Files\nodejs\node.exe` with your Node.js path
     - Find it by running: `where node` in Command Prompt
   - Replace `C:\path\to\Git-Hub-Page-Game\launcher.js` with the full path to `launcher.js`

3. Save the file and double-click it

4. Approve the registry changes

#### Finding Your Node.js Path on Windows

```cmd
where node
```

This will show you the full path, like `C:\Program Files\nodejs\node.exe`

### macOS

#### Step 1: Update the Plist File

1. Run the helper script to see your paths:
   ```bash
   node register-protocol.js
   ```

2. Open `externalfile-protocol.plist` in a text editor

3. Update the paths:
   - Replace `/usr/local/bin/node` with your Node.js path
     - Find it by running: `which node`
   - Replace `/path/to/Git-Hub-Page-Game/launcher.js` with the full path to `launcher.js`

#### Step 2: Install the LaunchAgent

1. Copy the plist file to LaunchAgents:
   ```bash
   cp externalfile-protocol.plist ~/Library/LaunchAgents/
   ```

2. Load the LaunchAgent:
   ```bash
   launchctl load ~/Library/LaunchAgents/externalfile-protocol.plist
   ```

3. Make the launcher executable:
   ```bash
   chmod +x launcher.js
   ```

#### Finding Your Node.js Path on macOS

```bash
which node
```

This will show you the path, like `/usr/local/bin/node` or `/opt/homebrew/bin/node`

### Linux

#### Step 1: Update the Desktop File

1. Run the helper script:
   ```bash
   node register-protocol.js
   ```

2. This creates `externalfile-protocol-generated.desktop` with your system's paths

3. Or manually edit `externalfile-protocol.desktop`:
   - Replace `/usr/bin/node` with your Node.js path
     - Find it by running: `which node`
   - Replace `/path/to/Git-Hub-Page-Game/launcher.js` with the full path to `launcher.js`

#### Step 2: Install the Desktop Entry

1. Create the applications directory if it doesn't exist:
   ```bash
   mkdir -p ~/.local/share/applications
   ```

2. Copy the desktop file (use the generated one if available):
   ```bash
   cp externalfile-protocol-generated.desktop ~/.local/share/applications/externalfile-protocol.desktop
   ```
   
   Or if you edited the original:
   ```bash
   cp externalfile-protocol.desktop ~/.local/share/applications/
   ```

3. Update the desktop database:
   ```bash
   update-desktop-database ~/.local/share/applications/
   ```

4. Set as the default handler for the protocol:
   ```bash
   xdg-mime default externalfile-protocol.desktop x-scheme-handler/externalfile
   ```

5. Make the launcher executable:
   ```bash
   chmod +x launcher.js
   ```

#### Finding Your Node.js Path on Linux

```bash
which node
```

This will show you the path, like `/usr/bin/node` or `/usr/local/bin/node`

## Testing the Protocol

After installation, test the protocol to make sure it works:

### Method 1: Browser Address Bar

1. Open your web browser
2. Type in the address bar: `externalfile:///game`
3. Press Enter
4. The game should open in a new browser window/tab

### Method 2: HTML Test File

Create a test HTML file with this content:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Protocol Test</title>
</head>
<body>
    <h1>Test External File Protocol</h1>
    <a href="externalfile:///game">Launch Game</a>
</body>
</html>
```

Open this file in your browser and click the link.

### Method 3: Command Line (for debugging)

#### Windows:
```cmd
start externalfile:///game
```

#### macOS/Linux:
```bash
open "externalfile:///game"
```

Or:
```bash
xdg-open "externalfile:///game"
```

## Troubleshooting

### The protocol doesn't work

1. **Verify Node.js is installed:**
   ```bash
   node --version
   ```
   Should show v12.0.0 or higher

2. **Check the paths in your configuration files:**
   - Make sure all paths use the correct format for your OS
   - Windows: Use backslashes `\` or escaped backslashes `\\`
   - macOS/Linux: Use forward slashes `/`

3. **Make sure the launcher is executable (macOS/Linux):**
   ```bash
   chmod +x launcher.js
   ```

4. **Test the launcher directly:**
   ```bash
   node launcher.js "externalfile:///game"
   ```
   This should open the game

### Windows: "Cannot find the file specified"

- Check that Node.js path in the registry is correct
- Run `where node` to find the correct path
- Edit the `.reg` file and import it again

### macOS: LaunchAgent not loading

1. Check the logs:
   ```bash
   cat /tmp/externalfile-protocol-error.log
   ```

2. Unload and reload:
   ```bash
   launchctl unload ~/Library/LaunchAgents/externalfile-protocol.plist
   launchctl load ~/Library/LaunchAgents/externalfile-protocol.plist
   ```

3. Check permissions:
   ```bash
   ls -la ~/Library/LaunchAgents/externalfile-protocol.plist
   ```

### Linux: xdg-open doesn't recognize the protocol

1. Verify the desktop file is in the right place:
   ```bash
   ls -la ~/.local/share/applications/externalfile-protocol.desktop
   ```

2. Check the MIME type association:
   ```bash
   xdg-mime query default x-scheme-handler/externalfile
   ```
   Should return: `externalfile-protocol.desktop`

3. Re-run the setup commands:
   ```bash
   update-desktop-database ~/.local/share/applications/
   xdg-mime default externalfile-protocol.desktop x-scheme-handler/externalfile
   ```

### Browser shows "Protocol not supported"

Some browsers may require additional permissions to handle custom protocols:

- **Chrome/Edge**: Should work automatically after protocol registration
- **Firefox**: May show a dialog asking to choose an application - select to remember the choice
- **Safari**: Should work automatically on macOS

### Game opens but shows "File not found"

The launcher script uses the `file://` protocol to open the game locally. Make sure:

1. The `index.html` file exists in the game directory
2. The launcher.js is in the same directory as index.html
3. You have proper file permissions to read the game files

## Uninstalling

If you want to remove the protocol handler:

### Windows

1. Create a file named `unregister-externalfile-protocol.reg` with:
   ```reg
   Windows Registry Editor Version 5.00
   
   [-HKEY_CLASSES_ROOT\externalfile]
   ```

2. Double-click the file and approve the changes

### macOS

```bash
launchctl unload ~/Library/LaunchAgents/externalfile-protocol.plist
rm ~/Library/LaunchAgents/externalfile-protocol.plist
```

### Linux

```bash
rm ~/.local/share/applications/externalfile-protocol.desktop
update-desktop-database ~/.local/share/applications/
```

## Additional Notes

- The launcher script automatically detects your operating system and uses the appropriate command to open your default browser
- The game runs entirely in your browser - the launcher just opens it for you
- You can move the game folder, but you'll need to re-register the protocol with the new paths
- The protocol handler is system-wide - it will work from any application on your computer

## Support

If you encounter issues not covered in this guide:

1. Make sure you're using a recent version of Node.js (v12+)
2. Check that all file paths are correct and use the right format for your OS
3. Try testing the launcher directly: `node launcher.js`
4. Check the generated log files (macOS: `/tmp/externalfile-protocol*.log`)

---

**Happy Gaming!** 🎮
