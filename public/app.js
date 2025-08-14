// NFT Academic Credential System - Frontend Application

class CredentialSystem {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = '';
        this.contractABI = [];
        this.isConnected = false;
        this.isMockMode = false;
        
        this.init();
    }

    async init() {
        try {
            await this.checkWeb3Connection();
            this.setupEventListeners();
            this.updateNetworkStatus();
            await this.loadContractInfo();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the application');
        }
    }

    async checkWeb3Connection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                this.isConnected = true;
                
                console.log('Connected to MetaMask');
                this.updateNetworkStatus('Connected to MetaMask', 'success');
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    this.handleAccountsChanged(accounts);
                });
                
                // Listen for network changes
                window.ethereum.on('chainChanged', (chainId) => {
                    this.handleChainChanged(chainId);
                });
                
            } catch (error) {
                console.error('User denied account access');
                this.updateNetworkStatus('MetaMask access denied', 'danger');
            }
        } else {
            console.log('No MetaMask detected');
            this.updateNetworkStatus('MetaMask not detected', 'warning');
        }
    }

    setupEventListeners() {
        // Issue credential form
        const issueForm = document.getElementById('issueCredentialForm');
        if (issueForm) {
            issueForm.addEventListener('submit', (e) => this.handleIssueCredential(e));
        }

        // Tab switching
        const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => this.handleTabChange(e));
        });
    }

    async loadContractInfo() {
        try {
            const response = await fetch('/api/contract-info');
            const data = await response.json();
            
            if (data.status === 'deployed' && data.address) {
                this.contractAddress = data.address;
                this.isMockMode = false;
                this.updateContractInfo(data);
            } else {
                this.isMockMode = true;
                this.updateContractInfo(data);
            }
        } catch (error) {
            console.error('Failed to load contract info:', error);
            this.showError('Failed to connect to backend server');
        }
    }

    updateContractInfo(data) {
        const contractInfo = document.getElementById('contractInfo');
        if (contractInfo) {
            if (data.status === 'deployed') {
                contractInfo.innerHTML = `
                    <div class="alert alert-success">
                        <h6><i class="fas fa-check-circle me-2"></i>Contract Deployed Successfully</h6>
                        <div class="mt-3">
                            <strong>Contract Address:</strong><br>
                            <code class="d-block mt-1 p-2 bg-light rounded">${data.address}</code>
                        </div>
                        <div class="mt-2">
                            <strong>Network:</strong> ${data.network}
                        </div>
                        <div class="mt-2">
                            <strong>Status:</strong> <span class="badge bg-success">Active</span>
                        </div>
                    </div>
                `;
            } else {
                contractInfo.innerHTML = `
                    <div class="alert alert-warning">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>Contract Not Deployed</h6>
                        <div class="mt-3">
                            <strong>Mode:</strong> <span class="badge bg-warning">Mock Mode</span>
                        </div>
                        <div class="mt-2">
                            <strong>Network:</strong> ${data.network}
                        </div>
                        <div class="mt-2">
                            <strong>Status:</strong> <span class="badge bg-warning">Testing Mode</span>
                        </div>
                        <div class="mt-3">
                            <p class="text-muted mb-2">${data.message}</p>
                            <small class="text-muted">
                                You can test the system functionality. When you deploy the smart contract, 
                                the system will automatically switch to blockchain mode.
                            </small>
                        </div>
                    </div>
                `;
            }
        }
    }

    updateNetworkStatus(message, type = 'info') {
        const statusElement = document.getElementById('network-status');
        if (statusElement) {
            const iconClass = this.getStatusIcon(type);
            const textClass = this.getStatusTextClass(type);
            
            statusElement.innerHTML = `
                <i class="fas ${iconClass} me-2"></i>
                <span class="${textClass}">${message}</span>
            `;
        }
    }

    getStatusIcon(type) {
        switch (type) {
            case 'success': return 'fa-circle text-success';
            case 'warning': return 'fa-circle text-warning';
            case 'danger': return 'fa-circle text-danger';
            default: return 'fa-circle text-info';
        }
    }

    getStatusTextClass(type) {
        switch (type) {
            case 'success': return 'text-success';
            case 'warning': return 'text-warning';
            case 'danger': return 'text-danger';
            default: return 'text-info';
        }
    }

    async handleIssueCredential(event) {
        event.preventDefault();
        
        if (!this.isConnected && !this.isMockMode) {
            this.showError('Please connect your MetaMask wallet first');
            return;
        }

        const formData = new FormData(event.target);
        const credentialData = {
            studentAddress: formData.get('studentAddress') || document.getElementById('studentAddress')?.value || '0x1234567890123456789012345678901234567890',
            studentName: formData.get('studentName') || document.getElementById('studentName').value,
            degreeType: formData.get('degreeType') || document.getElementById('degreeType').value,
            fieldOfStudy: formData.get('fieldOfStudy') || document.getElementById('fieldOfStudy').value,
            university: formData.get('university') || document.getElementById('university').value,
            graduationDate: formData.get('graduationDate') || document.getElementById('graduationDate').value
        };

        // Validate required fields
        if (!credentialData.studentName || !credentialData.degreeType || !credentialData.university) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Validate Ethereum address if provided
        if (credentialData.studentAddress && !ethers.utils.isAddress(credentialData.studentAddress)) {
            this.showError('Please enter a valid Ethereum address');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch('/api/issue-credential', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentialData)
            });

            const result = await response.json();
            
            if (result.success) {
                const modeText = this.isMockMode ? 'Mock Mode' : 'Blockchain Mode';
                this.showSuccess('Credential Issued Successfully!', 
                    `Student: ${credentialData.studentName}<br>
                     Degree: ${credentialData.degreeType}<br>
                     University: ${credentialData.university}<br>
                     Token ID: ${result.tokenId}<br><br>
                     <strong>Mode:</strong> ${modeText}<br>
                     <strong>Status:</strong> Credential stored successfully`);
                
                // Clear form
                event.target.reset();
            } else {
                this.showError(result.error || 'Failed to issue credential');
            }
        } catch (error) {
            console.error('Error issuing credential:', error);
            this.showError('Failed to issue credential. Please check your connection to the backend.');
        } finally {
            this.showLoading(false);
        }
    }

    async verifyCredential() {
        const tokenId = document.getElementById('tokenId').value;
        
        if (!tokenId) {
            this.showError('Please enter a token ID');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/verify-credential/${tokenId}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayCredential(result.credential);
            } else {
                this.showError(result.error || 'Failed to verify credential');
            }
        } catch (error) {
            console.error('Error verifying credential:', error);
            this.showError('Failed to verify credential. Please check your connection to the backend.');
        } finally {
            this.showLoading(false);
        }
    }

    async getStudentCredentials() {
        const address = document.getElementById('studentAddressVerify').value;
        
        if (!address) {
            this.showError('Please enter a student address');
            return;
        }

        if (!ethers.utils.isAddress(address)) {
            this.showError('Please enter a valid Ethereum address');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/student-credentials/${address}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayStudentCredentials(result.credentials);
            } else {
                this.showError(result.error || 'Failed to get student credentials');
            }
        } catch (error) {
            console.error('Error getting student credentials:', error);
            this.showError('Failed to get student credentials. Please check your connection to the backend.');
        } finally {
            this.showLoading(false);
        }
    }

    displayCredential(credential) {
        const resultDiv = document.getElementById('verificationResult');
        
        const statusClass = credential.isValid ? 'status-valid' : 'status-revoked';
        const statusText = credential.isValid ? 'Valid' : 'Revoked';
        
        resultDiv.innerHTML = `
            <div class="credential-card fade-in">
                <div class="credential-header">
                    <h5 class="credential-title">Credential #${credential.tokenId}</h5>
                    <span class="credential-status ${statusClass}">${statusText}</span>
                </div>
                <div class="credential-details">
                    <div class="credential-field">
                        <span class="credential-label">Student Name</span>
                        <span class="credential-value">${credential.studentName}</span>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">Degree Type</span>
                        <span class="credential-value">${credential.degreeType}</span>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">Field of Study</span>
                        <span class="credential-value">${credential.fieldOfStudy || 'N/A'}</span>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">University</span>
                        <span class="credential-value">${credential.university}</span>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">Graduation Date</span>
                        <span class="credential-value">${new Date(credential.graduationDate * 1000).toLocaleDateString()}</span>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">Issued At</span>
                        <span class="credential-value">${new Date(credential.issuedAt * 1000).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    displayStudentCredentials(credentials) {
        const resultDiv = document.getElementById('verificationResult');
        
        if (credentials.length === 0) {
            resultDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No credentials found for this address.
                </div>
            `;
            return;
        }

        let credentialsHtml = `
            <h6 class="mb-3">Found ${credentials.length} credential(s):</h6>
        `;

        credentials.forEach(credential => {
            const statusClass = credential.isValid ? 'status-valid' : 'status-revoked';
            const statusText = credential.isValid ? 'Valid' : 'Revoked';
            
            credentialsHtml += `
                <div class="credential-card fade-in">
                    <div class="credential-header">
                        <h6 class="credential-title">Credential #${credential.tokenId}</h6>
                        <span class="credential-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="credential-details">
                        <div class="credential-field">
                            <span class="credential-label">Student Name</span>
                            <span class="credential-value">${credential.studentName}</span>
                        </div>
                        <div class="credential-field">
                            <span class="credential-label">Degree Type</span>
                            <span class="credential-value">${credential.degreeType}</span>
                        </div>
                        <div class="credential-field">
                            <span class="credential-label">University</span>
                            <span class="credential-value">${credential.university}</span>
                        </div>
                        <div class="credential-field">
                            <span class="credential-label">Graduation Date</span>
                            <span class="credential-value">${new Date(credential.graduationDate * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        resultDiv.innerHTML = credentialsHtml;
    }

    handleTabChange(event) {
        const targetTab = event.target.getAttribute('data-bs-target');
        
        if (targetTab === '#view') {
            // Load credentials list when viewing tab
            this.loadCredentialsList();
        }
    }

    async loadCredentialsList() {
        // This would typically load from the blockchain
        // For demo purposes, we'll show a placeholder
        const credentialsList = document.getElementById('credentialsList');
        if (credentialsList) {
            if (this.isMockMode) {
                credentialsList.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Mock Mode Active:</strong> You can test the system by issuing credentials in the "Issue Credential" tab.
                        <br><br>
                        <strong>To test:</strong>
                        <ol>
                            <li>Go to "Issue Credential" tab</li>
                            <li>Fill out the form with test data</li>
                            <li>Submit to create a mock credential</li>
                            <li>Use "Verify Credential" tab to check the created credential</li>
                        </ol>
                    </div>
                `;
            } else {
                credentialsList.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Credentials list will be populated from the blockchain after deployment.
                        Use the "Verify Credential" tab to check individual credentials.
                    </div>
                `;
            }
        }
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.isConnected = false;
            this.updateNetworkStatus('No accounts connected', 'warning');
        } else {
            this.isConnected = true;
            this.updateNetworkStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, 'success');
        }
    }

    handleChainChanged(chainId) {
        window.location.reload();
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    showSuccess(title, message) {
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        const modalBody = document.getElementById('successModalBody');
        
        modalBody.innerHTML = `
            <h6>${title}</h6>
            <p class="mt-3">${message}</p>
        `;
        
        modal.show();
    }

    showError(message) {
        // Create a temporary error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Global functions for button clicks
function verifyCredential() {
    if (window.credentialSystem) {
        window.credentialSystem.verifyCredential();
    }
}

function getStudentCredentials() {
    if (window.credentialSystem) {
        window.credentialSystem.getStudentCredentials();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.credentialSystem = new CredentialSystem();
});

// Handle MetaMask connection button (if needed)
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected:', accounts[0]);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    } else {
        alert('Please install MetaMask to use this application');
    }
}
