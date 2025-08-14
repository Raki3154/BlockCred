// Simple Backend Startup Script
// This script can run the backend server without requiring all dependencies

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

// Mock data storage
const mockCredentials = new Map();
let mockTokenId = 1;

// Simple server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/styles.css') {
        fs.readFile(path.join(__dirname, 'public', 'styles.css'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading styles.css');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/app.js') {
        fs.readFile(path.join(__dirname, 'public', 'app.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading app.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
        return;
    }

    // API endpoints
    if (pathname === '/api/contract-info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            address: null,
            network: 'Mock Mode',
            status: 'not_deployed',
            message: 'Contract not deployed yet. Running in mock mode for testing.'
        }));
        return;
    }

    if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            blockchain: 'disconnected',
            contract: 'not_deployed',
            mode: 'mock'
        }));
        return;
    }

    if (pathname === '/api/issue-credential' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const credentialData = JSON.parse(body);
                
                // Validate required fields
                if (!credentialData.studentName || !credentialData.degreeType || !credentialData.university) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing required fields' }));
                    return;
                }

                // Create credential data
                const credential = {
                    tokenId: mockTokenId,
                    studentAddress: credentialData.studentAddress || '0x1234567890123456789012345678901234567890',
                    studentName: credentialData.studentName,
                    degreeType: credentialData.degreeType,
                    fieldOfStudy: credentialData.fieldOfStudy || '',
                    university: credentialData.university,
                    graduationDate: credentialData.graduationDate || Math.floor(Date.now() / 1000),
                    ipfsHash: 'QmDemoHash123',
                    issuedAt: Math.floor(Date.now() / 1000),
                    isRevoked: false
                };

                // Store in mock storage
                mockCredentials.set(mockTokenId, credential);
                mockTokenId++;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Credential issued successfully!',
                    credentialData: credential,
                    tokenId: credential.tokenId
                }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to parse request' }));
            }
        });
        return;
    }

    if (pathname.startsWith('/api/verify-credential/') && req.method === 'GET') {
        const tokenId = pathname.split('/').pop();
        const mockCredential = mockCredentials.get(parseInt(tokenId));
        
        if (mockCredential) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
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
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Credential not found' }));
        }
        return;
    }

    if (pathname.startsWith('/api/student-credentials/') && req.method === 'GET') {
        const address = pathname.split('/').pop();
        
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            credentials: studentCredentials
        }));
        return;
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`🚀 Simple Backend Server running on port ${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
    console.log('⚠️  Running in mock mode - no blockchain connection');
    console.log('💡 To use full backend, install dependencies and run: npm start');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
