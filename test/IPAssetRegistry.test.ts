import { expect } from "chai";
import { ethers } from "hardhat";

describe("IPAssetRegistry", function () {
  let ipAssetRegistry: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const IPAssetRegistry = await ethers.getContractFactory("IPAssetRegistry");
    ipAssetRegistry = await IPAssetRegistry.deploy();
    await ipAssetRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ipAssetRegistry.owner()).to.equal(owner.address);
    });

    it("Should start with zero IP assets", async function () {
      expect(await ipAssetRegistry.totalIPAssets()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a new IP asset", async function () {
      const tx = await ipAssetRegistry.mintIPAsset(
        "Test IP",
        "Test Description",
        "ipfs://test",
        50,
        true,
        false,
        "voting"
      );

      await expect(tx)
        .to.emit(ipAssetRegistry, "IPAssetMinted")
        .withArgs(1, owner.address, "Test IP", "ipfs://test", 50);

      expect(await ipAssetRegistry.totalIPAssets()).to.equal(1);

      const ipAsset = await ipAssetRegistry.getIPAsset(1);
      expect(ipAsset.name).to.equal("Test IP");
      expect(ipAsset.creator).to.equal(owner.address);
      expect(ipAsset.royaltyRate).to.equal(50);
    });

    it("Should reject empty name", async function () {
      await expect(
        ipAssetRegistry.mintIPAsset(
          "",
          "Test Description",
          "ipfs://test",
          50,
          true,
          false,
          "voting"
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject royalty rate > 100", async function () {
      await expect(
        ipAssetRegistry.mintIPAsset(
          "Test IP",
          "Test Description",
          "ipfs://test",
          101,
          true,
          false,
          "voting"
        )
      ).to.be.revertedWith("Royalty rate cannot exceed 100%");
    });
  });
});

