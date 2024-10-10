// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    IERC20 public token;
    bytes32 public merkleRoot;
    mapping(address => bool) public claimed;

    event TokensClaimed(address indexed claimant, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot) Ownable(msg.sender) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    function claimTokens(uint256 amount, bytes32[] calldata proof) external {
        require(
            verify(msg.sender, amount, proof),
            "Airdrop: Invalid Merkle proof"
        );

        require(!claimed[msg.sender], "Airdrop: Tokens already claimed");

        claimed[msg.sender] = true;
        token.transfer(msg.sender, amount);

        emit TokensClaimed(msg.sender, amount);
    }

    function verify(
        address recipient,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }

        return computedHash == merkleRoot;
    }

    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }
}
