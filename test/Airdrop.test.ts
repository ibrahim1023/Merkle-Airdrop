const { expect } = require("chai");
const hre = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { solidityPacked } = require("ethers");
const keccak256 = require("keccak256");

describe("Airdrop Contract", function () {
  let token, airdrop, owner, addr1, addr2, addr3;
  let merkleTree, merkleRoot, leaves, claims;

  before(async () => {
    [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();

    // Deploy the ERC20 token
    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();

    // Define airdrop claims and create Merkle Tree
    claims = [
      { address: addr1.address, amount: 100 },
      { address: addr2.address, amount: 200 },
      { address: addr3.address, amount: 300 },
    ];
    leaves = claims.map((claim) =>
      keccak256(
        solidityPacked(["address", "uint256"], [claim.address, claim.amount])
      )
    );
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();

    // Deploy the Airdrop contract with the Merkle root
    const Airdrop = await hre.ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(token.target, merkleRoot);

    // Fund the Airdrop contract with tokens
    await token.transfer(airdrop.target, 1000);
  });

  it("Should allow valid claim", async () => {
    const claim = claims[0];

    const leaf = keccak256(
      solidityPacked(["address", "uint256"], [claim.address, claim.amount])
    );
    const proof = merkleTree.getHexProof(leaf);
    await expect(airdrop.connect(addr1).claimTokens(claim.amount, proof))
      .to.emit(airdrop, "TokensClaimed")
      .withArgs(addr1.address, claim.amount);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(BigInt(claim.amount));
  });

  it("Should reject invalid claim", async () => {
    const invalidAmount = 500;
    const leaf = keccak256(
      solidityPacked(["address", "uint256"], [addr1.address, invalidAmount])
    );
    const proof = merkleTree.getHexProof(leaf);

    await expect(
      airdrop.connect(addr1).claimTokens(invalidAmount, proof)
    ).to.be.revertedWith("Airdrop: Invalid Merkle proof");
  });

  it("Should reject repeated claim", async () => {
    const claim = claims[0];
    const leaf = keccak256(
      solidityPacked(["address", "uint256"], [claim.address, claim.amount])
    );
    const proof = merkleTree.getHexProof(leaf);

    // Try to claim again (should revert)
    await expect(
      airdrop.connect(addr1).claimTokens(claim.amount, proof)
    ).to.be.revertedWith("Airdrop: Tokens already claimed");
  });
});
