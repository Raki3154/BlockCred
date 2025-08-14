#!/usr/bin/env node

/**
 * NFT Academic Credential System - Setup Script
 * This script helps with initial setup and deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎓 NFT Academic Credential System - Setup Script\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file from template...');
    try {
        fs.copyFileSync('env.example', '.env');
        console.log('✅ .env file created successfully!');
        console.log('⚠️  Please edit .env file with your configuration before proceeding.\n');
    } catch (error) {
        console.error('❌ Failed to create .env file:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
    process.exit(1);
}
console.log('✅ Node.js version check passed:', nodeVersion);

// Check if dependencies are installed
if (!fs.existsSync('node_modules')) {
    console.log('\n📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully!');
    } catch (error) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

// Compile contracts
console.log('\n🔨 Compiling smart contracts...');
try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log('✅ Smart contracts compiled successfully!');
} catch (error) {
    console.error('❌ Failed to compile smart contracts');
    process.exit(1);
}

// Run tests
console.log('\n🧪 Running tests...');
try {
    execSync('npx hardhat test', { stdio: 'inherit' });
    console.log('✅ All tests passed!');
} catch (error) {
    console.error('❌ Some tests failed');
    console.log('⚠️  You can still proceed, but please review the test failures');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Start local blockchain: npx hardhat node');
console.log('3. Deploy contract: npx hardhat run scripts/deploy.js --network localhost');
console.log('4. Start application: npm start');
console.log('\n📚 For more information, see README.md');
console.log('🚀 Happy coding!');
