const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating multi-browser extension packages for IlmTab...\n');

try {
  // Step 1: Build the client
  console.log('📦 Building the client application...');
  process.chdir('client');
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');
  console.log('✅ Client build completed!\n');

  // Step 2: Create extension directory
  const extensionDir = 'ilmtab-extension';
  if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir);
  }

  // Step 3: Copy built files from client/dist to extension directory
  const distDir = 'client/dist';
  if (fs.existsSync(distDir)) {
    // Copy all files from dist to extension directory
    const files = fs.readdirSync(distDir);
    files.forEach(file => {
      const srcPath = path.join(distDir, file);
      const destPath = path.join(extensionDir, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        const subFiles = fs.readdirSync(srcPath);
        subFiles.forEach(subFile => {
          fs.copyFileSync(path.join(srcPath, subFile), path.join(destPath, subFile));
        });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('✅ Copied built files to extension directory');
  }

  // Step 4: Create manifests for different browsers
  
  // Chrome/Edge Manifest (v3)
  const chromeManifest = {
    manifest_version: 3,
    name: "IlmTab",
    version: "0.1.0",
    description: "Transform your new tab into a spiritual sanctuary with daily Quranic verses, authentic Hadith, and Islamic productivity tools. Stay connected to your faith with every browser session.",
    chrome_url_overrides: {
      newtab: "index.html"
    },
    permissions: [
      "storage"
    ]
  };

  // Firefox Manifest (v2)
  const firefoxManifest = {
    manifest_version: 2,
    name: "IlmTab",
    version: "0.1.0",
    description: "Transform your new tab into a spiritual sanctuary with daily Quranic verses, authentic Hadith, and Islamic productivity tools. Stay connected to your faith with every browser session.",
    chrome_url_overrides: {
      newtab: "index.html"
    },
    permissions: [
      "storage"
    ],
    applications: {
      gecko: {
        id: "ilmtab@example.com",
        strict_min_version: "57.0"
      }
    }
  };

  // Write manifests
  fs.writeFileSync(path.join(extensionDir, 'manifest.json'), JSON.stringify(chromeManifest, null, 2));
  fs.writeFileSync(path.join(extensionDir, 'manifest-firefox.json'), JSON.stringify(firefoxManifest, null, 2));
  console.log('✅ Created browser-specific manifests');

  // Step 5: Copy additional files
  const filesToCopy = ['README.md', 'LICENSE'];
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(extensionDir, file));
      console.log(`✅ Copied ${file}`);
    }
  });

  // Step 6: Create installation instructions
  const instructions = `# IlmTab Browser Extension - Installation Guide

## What is IlmTab?
IlmTab transforms your new tab page into an Islamic spiritual dashboard with daily Quran verses, authentic Hadith, and productivity tools.

## Prerequisites
**IMPORTANT**: The IlmTab server must be running before installing the extension.

1. Navigate to the \`server\` directory
2. Run \`npm install\` then \`npm start\`
3. Ensure the server is running on http://localhost:4000

## Installation Instructions

### For Chrome/Chromium/Edge:
1. Open your browser and go to:
   - Chrome: \`chrome://extensions/\`
   - Edge: \`edge://extensions/\`
   - Brave: \`brave://extensions/\`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this folder (containing manifest.json)
5. The extension should appear in your extensions list

### For Firefox:
1. Rename \`manifest-firefox.json\` to \`manifest.json\` (replace the existing one)
2. Open Firefox and go to \`about:debugging\`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the \`manifest.json\` file in this folder

### For Safari:
Safari requires a different approach using Xcode. Contact the developer for Safari support.

## Testing
1. Open a new tab in your browser
2. You should see the IlmTab interface instead of the default new tab page
3. Verify that Islamic content loads properly
4. Test audio playback and other features

## Features
- Daily Quran verses with audio recitation
- Authentic Hadith from major collections
- Search functionality for Quran verses
- Favorites system to save content
- Todo list and productivity tools
- Weather and time display
- Customizable settings (languages, reciters, translations)

## Troubleshooting
- **CORS Errors**: Ensure the server is running with updated CORS configuration
- **Content Not Loading**: Check that http://localhost:4000 is accessible
- **Extension Not Loading**: Verify you selected the correct folder containing manifest.json

## Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Firefox (with manifest swap)
- ✅ Other Chromium-based browsers
- ❓ Safari (requires additional setup)

Built on: ${new Date().toLocaleString()}
Version: 0.1.0
`;

  fs.writeFileSync(path.join(extensionDir, 'INSTALL.txt'), instructions);
  console.log('✅ Created installation instructions');

  console.log('\n🎉 Multi-browser extension package created successfully!');
  console.log('\n📁 Extension files are in:', extensionDir);
  console.log('📋 Supported browsers:');
  console.log('  ✅ Chrome/Edge/Brave (use manifest.json)');
  console.log('  ✅ Firefox (rename manifest-firefox.json to manifest.json)');
  console.log('\n🚀 Ready to install on multiple browsers!');

} catch (error) {
  console.error('❌ Error creating extension package:', error.message);
  process.exit(1);
}
