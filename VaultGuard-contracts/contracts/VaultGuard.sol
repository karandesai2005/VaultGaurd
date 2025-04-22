// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VaultGuard {
    // Mapping to store IPFS hashes for each user
    mapping(address => string) private ipfsHashes;

    // Event to log when a hash is stored
    event HashStored(address indexed user, string ipfsHash);

    function storeHash(string calldata ipfsHash) external {
        ipfsHashes[msg.sender] = ipfsHash;
        emit HashStored(msg.sender, ipfsHash);
    }

    // Retrieve the IPFS hash for the user
    function getHash() external view returns (string memory) {
        return ipfsHashes[msg.sender];
    }
}