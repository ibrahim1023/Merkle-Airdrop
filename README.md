# Airdrop Contract with Merkle Tree Verification

This project implements an ERC20 token airdrop contract that uses a Merkle Tree for proof verification. The airdrop contract distributes tokens to eligible users, and the Merkle Tree is used to verify the eligibility of users claiming tokens. The project also includes tests using Hardhat and merkletreejs to ensure correctness.

## Key Features

- **Merkle Tree Proof Verification**: Ensures users can only claim tokens if they are included in the airdrop list (Merkle Root).
- **ERC20 Token Transfer**: Uses an ERC20 token for the airdrop.
- **Claim Prevention**: Prevents double-claiming by tracking claimed addresses.
- **Upgradeable Merkle Root**: Allows the contract owner to update the Merkle Root if necessary.
- **Tests**: Provides full coverage tests using Hardhat, ethers.js, and merkletreejs to validate the contract's behavior.

## Contract Overview

- **Airdrop Contract**: Handles claims from eligible users based on the Merkle Tree proof.
- **Merkle Tree Construction**: The Merkle Tree is generated off-chain using the merkletreejs library, and the root is stored in the contract.
ERC20 Token: A sample token is deployed alongside the airdrop contract for testing purposes.

## Usage

### Compile the contracts
```
npx hardhat compile
```

### Run the tests
```
npx hardhat test
```

## Tests 

```
Airdrop Contract
    ✔ Should allow valid claim
    ✔ Should reject invalid claim
    ✔ Should reject repeated claim
```
