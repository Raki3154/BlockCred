# NFT-Based Academic Credential Verification System

A decentralized system where universities issue blockchain-verified digital degrees to prevent certificate forgery using Ethereum blockchain technology.

## 🚀 Features

- **Smart Contract**: ERC-721 NFT contract for academic credentials
- **University Authorization**: Only authorized universities can issue credentials
- **Credential Verification**: Instant global verification of academic credentials
- **IPFS Integration**: Decentralized storage for supporting documents
- **MetaMask Integration**: Seamless wallet connection

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React/HTML)  │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NFT
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment file and configure it:

```bash
cp env.example .env
```

## 🚀 Quick Start

### 1. Start Local Blockchain (Hardhat)

```bash
npx hardhat node
```

This will start a local Ethereum node on `http://127.0.0.1:8545`

### 2. Deploy Smart Contract

In a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Note down the deployed contract address.

### 3. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 Development

### Compile Smart Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Run Tests with Coverage

```bash
npx hardhat coverage
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 📚 Smart Contract Details

### Contract: `AcademicCredential.sol`

**Features:**
- ERC-721 compliant NFT
- University authorization system
- Credential issuance and verification
- Revocation mechanism
- IPFS metadata support

## 🌐 Web Interface

### Main Features

1. **Issue Credential Tab**
   - Form for universities to issue new credentials
   - Student information input
   - Document upload support

2. **Verify Credential Tab**
   - Verify credentials by Token ID
   - Search by student address
   - Display credential details

3. **View Credentials Tab**
   - List all credentials
   - Filter and search capabilities

4. **Contract Info Tab**
   - Smart contract details
   - Network information
   - Deployment status

## 🔐 Security Features

- **Access Control**: Only authorized universities can issue credentials
- **Ownership Verification**: NFT ownership proves credential authenticity
- **Immutable Records**: Blockchain ensures data cannot be tampered with
- **Revocation System**: Credentials can be revoked if necessary

## 📱 Usage Guide

### For Universities

1. **Connect MetaMask**: Ensure your wallet is connected to the correct network
2. **Issue Credential**: Fill out the credential form with student details
3. **Upload Documents**: Attach supporting documents (optional)
4. **Submit**: The credential will be minted as an NFT

### For Students

1. **Receive Credential**: Credentials are automatically sent to your wallet address
2. **View Credentials**: Check your credentials in the "View Credentials" tab
3. **Share**: Share your credential Token ID for verification

### For Employers/Verifiers

1. **Verify Credential**: Use the "Verify Credential" tab
2. **Enter Token ID**: Input the credential's Token ID
3. **View Details**: See all credential information and validity status

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npx hardhat test test/AcademicCredential.test.js
```

### Test Coverage

```bash
npx hardhat coverage
```

## 🚀 Deployment

### Local Development

1. Start Hardhat node: `npx hardhat node`
2. Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`
3. Start server: `npm start`

### Sepolia Testnet

1. Configure `.env` with Sepolia network details
2. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
3. Verify contract on Etherscan

### Mainnet

1. Configure `.env` with mainnet network details
2. Deploy: `npx hardhat run scripts/deploy.js --network mainnet`
3. Verify contract on Etherscan

## 🔧 Configuration

### Network Configuration

The system supports multiple networks:

- **Localhost**: For development and testing
- **Sepolia**: Ethereum testnet
- **Mainnet**: Ethereum mainnet

### IPFS Configuration

For production use, configure IPFS:

```env
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
```

## 📊 Monitoring

### Contract Events

Monitor these events for system activity:

- `CredentialIssued`: When a new credential is issued
- `CredentialRevoked`: When a credential is revoked
- `UniversityAuthorized`: When university authorization changes

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🛡️ Security Considerations

1. **Private Key Management**: Never expose private keys in code
2. **Network Security**: Use HTTPS in production
3. **Access Control**: Regularly review university authorizations
4. **Smart Contract Audits**: Consider professional audits for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

1. **MetaMask Connection**: Ensure MetaMask is installed and connected
2. **Network Mismatch**: Verify you're on the correct network
3. **Gas Fees**: Ensure sufficient ETH for transactions
4. **Contract Deployment**: Check deployment logs for errors

### Getting Help

- Check the test files for usage examples
- Review the smart contract code
- Check browser console for JavaScript errors
- Verify network connectivity

## 🔮 Future Enhancements

- **Multi-chain Support**: Support for other blockchains
- **Advanced Metadata**: Rich credential metadata
- **Batch Operations**: Issue multiple credentials at once
- **Analytics Dashboard**: Credential issuance statistics
- **Mobile App**: Native mobile application
- **API Integration**: Third-party system integration





