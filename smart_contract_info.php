<?php
// smart_contract_info.php
$config = require __DIR__ . '/config.php';
// minimal ABI for ERC721 mint & ownerOf functions - expand as needed
$abi = [
    // constructor omitted
    ["inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"stateMutability":"nonpayable","type":"constructor"],
    // ownerOf
    [
        "inputs" => [
            ["internalType"=>"uint256","name"=>"tokenId","type"=>"uint256"]
        ],
        "name" => "ownerOf",
        "outputs" => [
            ["internalType"=>"address","name":"","type"=>"address"]
        ],
        "stateMutability" => "view",
        "type" => "function"
    ],
    // tokenURI
    [
        "inputs" => [
            ["internalType"=>"uint256","name":"tokenId","type"=>"uint256"]
        ],
        "name" => "tokenURI",
        "outputs" => [
            ["internalType"=>"string","name":"","type"=>"string"]
        ],
        "stateMutability" => "view",
        "type" => "function"
    ],
    // mint (example function name in many custom contracts)
    [
        "inputs" => [
            ["internalType"=>"address","name":"to","type"=>"address"],
            ["internalType"=>"string","name":"tokenURI","type"=>"string"]
        ],
        "name" => "mintCredential",
        "outputs" => [
            ["internalType"=>"uint256","name":"","type"=>"uint256"]
        ],
        "stateMutability" => "nonpayable",
        "type" => "function"
    ]
];

header('Content-Type: application/json');
echo json_encode([
    'address' => $config['contract']['address'] ?? null,
    'rpc_url' => $config['contract']['rpc_url'] ?? null,
    'abi' => $abi
]);
