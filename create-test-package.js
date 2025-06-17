const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating test package for IlmTab extension...\n');

try {
  // Step 1: Build the client
  console.log('📦 Building the client application...');
  process.chdir('client');
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');
  console.log('✅ Client build completed!\n');

  // Step 2: Create package directory
  const packageDir = 'ilmtab-test-package';
  if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packageDir);
  console.log('📁 Created package directory\n');

  // Step 3: Copy built files
  console.log('📋 Copying files...');
  
  // Copy client dist folder
  function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
      if (fs.lstatSync(path.join(from, element)).isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else {
        copyFolderSync(path.join(from, element), path.join(to, element));
      }
    });
  }
  
  const distPath = 'dist';
  if (fs.existsSync(distPath)) {
    copyFolderSync(distPath, path.join(packageDir, 'dist'));
    console.log('  ✅ Copied dist folder');
  } else {
    console.log('  ❌ Error: dist folder not found!');
    console.log('  📍 Looking for dist folder at:', path.resolve(distPath));
    console.log('  📂 Client directory contents:');
    if (fs.existsSync('client')) {
      fs.readdirSync('client').forEach(item => {
        console.log(`    - ${item}`);
      });
    } else {
      console.log('    - client directory not found!');
    }
    throw new Error('dist folder not found');
  }
  
  // Copy manifest and other root files
  const filesToCopy = [
    'client/public/manifest.json',
    'README.md',
    'LICENSE'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      const fileName = path.basename(file);
      fs.copyFileSync(file, path.join(packageDir, fileName));
      console.log(`  ✅ Copied ${fileName}`);
    }
  });

  // Step 4: Create installation instructions
  const instructions = `# IlmTab Extension - Test Package

## Installation Instructions for Chrome/Edge:

1. **Open Chrome/Edge** and go to Extensions page:
   - Chrome: chrome://extensions/
   - Edge: edge://extensions/

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Select the "dist" folder inside this package
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Optional):
   - Click the puzzle piece icon in your browser toolbar
   - Find "IlmTab" and click the pin icon to keep it visible

## Usage:
- Click the IlmTab icon in your browser toolbar
- Or open a new tab to see the Islamic dashboard

## Features to Test:
- ✅ Daily Ayah display with audio
- ✅ Hadith of the day
- ✅ Prayer times and Islamic calendar
- ✅ Quran search functionality
- ✅ Favorites system (save ayahs and hadiths)
- ✅ Audio recitation with multiple reciters
- ✅ Settings customization
- ✅ Todo list and productivity features

## Feedback:
Please test all features and report any issues or suggestions!

---
Built on: ${new Date().toLocaleString()}
Version: 0.1.0
`;

  fs.writeFileSync(path.join(packageDir, 'INSTALLATION.md'), instructions);
  console.log('  ✅ Created installation instructions\n');

  // Step 5: Create zip file using PowerShell
  console.log('🗜️ Creating zip file...');
  const zipCommand = `powershell "Compress-Archive -Path '${packageDir}\\*' -DestinationPath 'ilmtab-extension-test.zip' -Force"`;
  execSync(zipCommand, { stdio: 'inherit' });
  
  console.log('✅ Package created successfully!\n');
  console.log('📦 Files created:');
  console.log('  📁 ilmtab-test-package/ (folder with all files)');
  console.log('  📦 ilmtab-extension-test.zip (ready to share)\n');
  
  console.log('🎯 Next steps:');
  console.log('  1. Share "ilmtab-extension-test.zip" with your brother');
  console.log('  2. He should extract it and follow INSTALLATION.md');
  console.log('  3. He loads the "dist" folder as unpacked extension\n');
  
  console.log('🚀 Happy testing!');

} catch (error) {
  console.error('❌ Error creating package:', error.message);
  process.exit(1);
}
