const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Contract ABI and address (will be updated after deployment)
let contractAddress = '';
let contractABI = [];

// Mock contract data for testing (remove when real contract is deployed)
const mockCredentials = new Map();
let mockTokenId = 1;

// Initialize provider
let provider;
let signer;

// Initialize blockchain connection
async function initializeBlockchain() {
    try {
        if (process.env.NODE_ENV === 'production') {
            // For production, use Infura or other provider
            provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
        } else {
            // For development, use local hardhat node
            provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }
        
        console.log('Blockchain provider initialized');
    } catch (error) {
        console.error('Failed to initialize blockchain provider:', error);
        console.log('Running in mock mode for testing');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get contract info
app.get('/api/contract-info', (req, res) => {
    if (contractAddress && contractABI.length > 0) {
        res.json({
            address: contractAddress,
            network: process.env.NODE_ENV === 'production' ? 'Sepolia' : 'Localhost',
            status: 'deployed'
        });
    } else {
        res.json({
            address: null,
            network: 'Mock Mode',
            status: 'not_deployed',
            message: 'Contract not deployed yet. Running in mock mode for testing.'
        });
    }
});

// Issue credential (university only)
app.post('/api/issue-credential', upload.single('document'), async (req, res) => {
    try {
        const {
            studentAddress,
            studentName,
            degreeType,
            fieldOfStudy,
            university,
            graduationDate
        } = req.body;

        // Validate input
        if (!studentAddress || !studentName || !degreeType || !university) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate Ethereum address
        if (!ethers.isAddress(studentAddress)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // For demo purposes, we'll use a placeholder IPFS hash
        // In production, you would upload the document to IPFS
        const ipfsHash = 'QmDemoHash123'; // Replace with actual IPFS upload

        // Create credential data
        const credentialData = {
            tokenId: mockTokenId,
            studentAddress,
            studentName,
            degreeType,
            fieldOfStudy: fieldOfStudy || '',
            university,
            graduationDate: graduationDate || Math.floor(Date.now() / 1000),
            ipfsHash,
            issuedAt: Math.floor(Date.now() / 1000),
            isRevoked: false
        };

        // Store in mock storage
        mockCredentials.set(mockTokenId, credentialData);
        mockTokenId++;

        res.json({
            success: true,
            message: 'Credential issued successfully!',
            credentialData,
            tokenId: credentialData.tokenId
        });

    } catch (error) {
        console.error('Error issuing credential:', error);
        res.status(500).json({ error: 'Failed to issue credential' });
    }
});

// Verify credential
app.get('/api/verify-credential/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        
        // Check if we have a real contract deployed
        if (contractAddress && contractABI.length > 0 && provider) {
            try {
                const contract = new ethers.Contract(contractAddress, contractABI, provider);
                
                // Get credential details from blockchain
                const credential = await contract.getCredential(tokenId);
                const isValid = await contract.isCredentialValid(tokenId);

                res.json({
                    success: true,
                    credential: {
                        tokenId: tokenId,
                        studentName: credential.studentName,
                        degreeType: credential.degreeType,
                        fieldOfStudy: credential.fieldOfStudy,
                        university: credential.university,
                        graduationDate: credential.graduationDate.toString(),
                        ipfsHash: credential.ipfsHash,
                        isRevoked: credential.isRevoked,
                        issuedAt: credential.issuedAt.toString(),
                        isValid: isValid
                    }
                });
                return;
            } catch (blockchainError) {
                console.log('Blockchain verification failed, falling back to mock data');
            }
        }

        // Fallback to mock data
        const mockCredential = mockCredentials.get(parseInt(tokenId));
        if (mockCredential) {
            res.json({
                success: true,
                credential: {
                    tokenId: mockCredential.tokenId,
                    studentName: mockCredential.studentName,
                    degreeType: mockCredential.degreeType,
                    fieldOfStudy: mockCredential.fieldOfStudy,
                    university: mockCredential.university,
                    graduationDate: mockCredential.graduationDate.toString(),
                    ipfsHash: mockCredential.ipfsHash,
                    isRevoked: mockCredential.isRevoked,
                    issuedAt: mockCredential.issuedAt.toString(),
                    isValid: !mockCredential.isRevoked
                }
            });
        } else {
            res.status(404).json({ error: 'Credential not found' });
        }

    } catch (error) {
        console.error('Error verifying credential:', error);
        res.status(500).json({ error: 'Failed to verify credential' });
    }
});

// Get student credentials
app.get('/api/student-credentials/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // Check if we have a real contract deployed
        if (contractAddress && contractABI.length > 0 && provider) {
            try {
                const contract = new ethers.Contract(contractAddress, contractABI, provider);
                const tokenIds = await contract.getStudentCredentials(address);
                
                const credentials = [];
                for (const tokenId of tokenIds) {
                    const credential = await contract.getCredential(tokenId);
                    const isValid = await contract.isCredentialValid(tokenId);
                    
                    credentials.push({
                        tokenId: tokenId.toString(),
                        studentName: credential.studentName,
                        degreeType: credential.degreeType,
                        fieldOfStudy: credential.fieldOfStudy,
                        university: credential.university,
                        graduationDate: credential.graduationDate.toString(),
                        ipfsHash: credential.ipfsHash,
                        isRevoked: credential.isRevoked,
                        issuedAt: credential.issuedAt.toString(),
                        isValid: isValid
                    });
                }

                res.json({
                    success: true,
                    credentials: credentials
                });
                return;
            } catch (blockchainError) {
                console.log('Blockchain query failed, falling back to mock data');
            }
        }

        // Fallback to mock data
        const studentCredentials = [];
        for (const [tokenId, credential] of mockCredentials) {
            if (credential.studentAddress.toLowerCase() === address.toLowerCase()) {
                studentCredentials.push({
                    tokenId: credential.tokenId.toString(),
                    studentName: credential.studentName,
                    degreeType: credential.degreeType,
                    fieldOfStudy: credential.fieldOfStudy,
                    university: credential.university,
                    graduationDate: credential.graduationDate.toString(),
                    ipfsHash: credential.ipfsHash,
                    isRevoked: credential.isRevoked,
                    issuedAt: credential.issuedAt.toString(),
                    isValid: !credential.isRevoked
                });
            }
        }

        res.json({
            success: true,
            credentials: studentCredentials
        });

    } catch (error) {
        console.error('Error getting student credentials:', error);
        res.status(500).json({ error: 'Failed to get student credentials' });
    }
});

// Update contract address and ABI (called after deployment)
app.post('/api/update-contract', (req, res) => {
    const { address, abi } = req.body;
    
    if (address && abi) {
        contractAddress = address;
        contractABI = abi;
        res.json({ success: true, message: 'Contract updated successfully' });
    } else {
        res.status(400).json({ error: 'Missing contract address or ABI' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        blockchain: provider ? 'connected' : 'disconnected',
        contract: contractAddress ? 'deployed' : 'not_deployed',
        mode: contractAddress ? 'blockchain' : 'mock'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
    await initializeBlockchain();
    
    if (!contractAddress) {
        console.log('⚠️  Running in mock mode - no contract deployed yet');
        console.log('💡 Deploy your contract and update via /api/update-contract');
    }
});

module.exports = app;
