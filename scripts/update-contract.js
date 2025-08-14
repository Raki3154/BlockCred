const fs = require('fs');
const path = require('path');

/**
 * Script to update contract address and ABI in the backend
 * Run this after deploying the smart contract
 */

async function updateContract() {
    try {
        // Read the contract artifacts
        const artifactsPath = path.join(__dirname, '../artifacts/contracts/AcademicCredential.sol/AcademicCredential.json');
        
        if (!fs.existsSync(artifactsPath)) {
            console.error('❌ Contract artifacts not found. Please compile the contract first: npx hardhat compile');
            process.exit(1);
        }

        const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        const contractABI = artifacts.abi;

        // Get contract address from user input
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('🔧 Contract Update Script\n');
        console.log('This script will update the backend with the deployed contract information.\n');

        const contractAddress = await new Promise((resolve) => {
            rl.question('Enter the deployed contract address: ', (address) => {
                resolve(address.trim());
            });
        });

        if (!contractAddress || !contractAddress.startsWith('0x')) {
            console.error('❌ Invalid contract address');
            rl.close();
            process.exit(1);
        }

        // Create the update payload
        const updatePayload = {
            address: contractAddress,
            abi: contractABI
        };

        // Send update to backend
        console.log('\n📡 Updating backend with contract information...');
        
        const response = await fetch('http://localhost:3000/api/update-contract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Backend updated successfully!');
            console.log(`📋 Contract Address: ${contractAddress}`);
            console.log(`🔗 Network: ${result.network || 'Localhost'}`);
        } else {
            console.error('❌ Failed to update backend');
            const error = await response.text();
            console.error('Error:', error);
        }

        rl.close();
        
    } catch (error) {
        console.error('❌ Error updating contract:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend server is running: npm start');
        }
        
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    updateContract();
}

module.exports = { updateContract };
