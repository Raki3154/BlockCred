# Backend-Frontend Connection Setup

This document explains how to connect the backend server with the frontend application for the NFT Academic Credential System.

## 🚀 Quick Start (Recommended)

### Option 1: Simple Mock Server (No Dependencies Required)

1. **Start the simple backend server:**
   ```bash
   node start-backend.js
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```

3. **Test the system:**
   - Go to "Issue Credential" tab
   - Fill out the form with test data
   - Submit to create a mock credential
   - Use "Verify Credential" tab to check the created credential

### Option 2: Full Backend Server (Requires Dependencies)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the full backend server:**
   ```bash
   npm start
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```

## 🔗 API Endpoints

The backend provides the following API endpoints:

### Contract Information
- `GET /api/contract-info` - Get contract deployment status
- `GET /api/health` - Health check endpoint

### Credential Management
- `POST /api/issue-credential` - Issue a new academic credential
- `GET /api/verify-credential/:tokenId` - Verify a specific credential
- `GET /api/student-credentials/:address` - Get all credentials for a student address

### Contract Update
- `POST /api/update-contract` - Update contract address and ABI after deployment

## 📱 Frontend Features

### Mock Mode (Default)
- ✅ Issue credentials (stored in memory)
- ✅ Verify credentials by token ID
- ✅ View student credentials by address
- ✅ No blockchain connection required
- ✅ Perfect for testing and development

### Blockchain Mode (After Contract Deployment)
- ✅ Full blockchain integration
- ✅ Real NFT minting
- ✅ IPFS document storage
- ✅ MetaMask wallet integration
- ✅ Production-ready functionality

## 🧪 Testing the Connection

### 1. Test Backend Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "blockchain": "disconnected",
  "contract": "not_deployed",
  "mode": "mock"
}
```

### 2. Test Credential Issuance
```bash
curl -X POST http://localhost:3000/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "degreeType": "Bachelor",
    "university": "Test University",
    "fieldOfStudy": "Computer Science"
  }'
```

### 3. Test Credential Verification
```bash
curl http://localhost:3000/api/verify-credential/1
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
SEPOLIA_URL=your_infura_url_here
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
```

### Port Configuration
- Default port: 3000
- Change via environment variable: `PORT=8080`
- Or modify the server files directly

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000
   
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **CORS Issues**
   - The backend includes CORS headers
   - If you still have issues, check browser console for errors

3. **File Not Found Errors**
   - Ensure all files are in the correct directories
   - Check file paths in the server code

4. **Dependencies Issues**
   - Try using the simple mock server instead
   - Or reinstall dependencies: `npm install --force`

### Debug Mode
Enable debug logging by adding this to your server startup:
```bash
DEBUG=* node start-backend.js
```

## 🔄 Switching Between Modes

### From Mock to Blockchain Mode

1. **Deploy your smart contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. **Update the backend with contract info:**
   ```bash
   curl -X POST http://localhost:3000/api/update-contract \
     -H "Content-Type: application/json" \
     -d '{
       "address": "0x...",
       "abi": [...]
     }'
   ```

3. **Restart the server:**
   ```bash
   npm start
   ```

## 📚 Next Steps

1. **Test the mock functionality** - Ensure everything works without blockchain
2. **Deploy the smart contract** - Use Hardhat to deploy to local or test network
3. **Connect to blockchain** - Update the backend with contract information
4. **Test blockchain functionality** - Verify real NFT minting works
5. **Deploy to production** - Use Sepolia testnet or mainnet

## 🆘 Need Help?

- Check the browser console for JavaScript errors
- Check the server console for backend errors
- Verify all files are in the correct locations
- Ensure the server is running on the expected port
- Test API endpoints individually with curl or Postman

The system is designed to work in both mock and blockchain modes, so you can start testing immediately without any blockchain setup!
