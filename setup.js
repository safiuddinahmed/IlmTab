#!/usr/bin/env node

/**
 * IlmTab Setup Script
 * Automated setup for the Islamic Knowledge Browser Extension
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✓ ${description} completed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    throw error;
  }
}

function createEnvFile() {
  const envPath = join('server', '.env');
  const envExamplePath = join('server', '.env.example');
  
  if (existsSync(envPath)) {
    log(`${colors.yellow}⚠ .env file already exists, skipping creation${colors.reset}`);
    return;
  }

  if (existsSync(envExamplePath)) {
    const envContent = readFileSync(envExamplePath, 'utf8');
    writeFileSync(envPath, envContent);
    log(`${colors.green}✓ Created .env file from template${colors.reset}`);
  } else {
    // Create a basic .env file
    const defaultEnv = `# Hadith API Configuration
HADITH_API_KEY=your_hadith_api_key_here

# Unsplash API Configuration (for background images)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;
    writeFileSync(envPath, defaultEnv);
    log(`${colors.green}✓ Created default .env file${colors.reset}`);
  }
}

function displayWelcome() {
  log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    🕌 IlmTab Setup 🕌                        ║
║        Islamic Knowledge Browser Extension Setup             ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  log(`${colors.green}Welcome to IlmTab - Your Islamic Knowledge Browser Extension!${colors.reset}`);
  log(`This script will help you set up the extension quickly.\n`);
}

function displayCompletion() {
  log(`\n${colors.bold}${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete! 🎉                    ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log(`${colors.green}Your IlmTab application is now ready!${colors.reset}\n`);
  
  log(`${colors.bold}Next Steps:${colors.reset}`);
  log(`${colors.blue}1.${colors.reset} Configure your API keys in ${colors.yellow}server/.env${colors.reset}`);
  log(`   - Get Hadith API key from: https://hadithapi.com/`);
  log(`   - Get Unsplash API key from: https://unsplash.com/developers`);
  log(`\n${colors.blue}2.${colors.reset} Start the development servers:`);
  log(`   ${colors.yellow}# Terminal 1 - Start the backend server${colors.reset}`);
  log(`   ${colors.green}cd server && npm run dev${colors.reset}`);
  log(`\n   ${colors.yellow}# Terminal 2 - Start the frontend application${colors.reset}`);
  log(`   ${colors.green}cd client && npm run dev${colors.reset}`);
  log(`\n${colors.blue}3.${colors.reset} Open your browser and navigate to: ${colors.green}http://localhost:3000${colors.reset}`);
  
  log(`\n${colors.bold}May Allah (SWT) bless your learning journey! 🤲${colors.reset}`);
}

async function main() {
  try {
    displayWelcome();
    
    // Check Node.js version
    log(`${colors.blue}Checking Node.js version...${colors.reset}`);
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Please install Node.js 16 or higher.`);
    }
    log(`${colors.green}✓ Node.js ${nodeVersion} is compatible${colors.reset}`);

    // Install server dependencies
    runCommand('cd server && npm install', 'Installing server dependencies');
    
    // Install client dependencies
    runCommand('cd client && npm install', 'Installing client dependencies');
    
    // Create environment file
    log(`\n${colors.blue}Setting up environment configuration...${colors.reset}`);
    createEnvFile();
    
    // Build client for production (optional)
    log(`\n${colors.blue}Building client application...${colors.reset}`);
    try {
      runCommand('cd client && npm run build', 'Building client application');
    } catch (error) {
      log(`${colors.yellow}⚠ Build failed, but you can still run in development mode${colors.reset}`);
    }
    
    displayCompletion();
    
  } catch (error) {
    log(`\n${colors.red}${colors.bold}Setup failed:${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    log(`\n${colors.yellow}Please check the error above and try again.${colors.reset}`);
    log(`${colors.yellow}You can also set up manually by following the README.md instructions.${colors.reset}`);
    process.exit(1);
  }
}

// Run the setup
main();
