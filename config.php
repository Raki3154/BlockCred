<?php
// config.php
return [
    'db' => [
        'host' => 'localhost',
        'dbname' => 'nft_credentials',
        'user' => 'root',
        'pass' => 'raki3154',
        'charset' => 'utf8mb4',
    ],
    // If you deployed the contract, set address and RPC endpoint here
    'contract' => [
        'address' => '0xYOUR_CONTRACT_ADDRESS_HERE',
        'rpc_url' => 'https://rpc.your-chain.example', // e.g. https://mainnet.infura.io/v3/PROJECT_ID or local Ganache/Hardhat
        // optionally ABI path or inline ABI in smart_contract_info.php
    ],
    // file upload settings
    'uploads_dir' => __DIR__ . '/uploads',
    'max_file_size' => 5 * 1024 * 1024, // 5 MB
];
