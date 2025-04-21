

import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarket", function () {
  async function deployFixture() {
    const [owner, buyer] = await ethers.getSigners();

    // 部署 ERC20 Token
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    // 部署 NFT 合约
    const NFT = await ethers.getContractFactory("MyNFT");
    const nft = await NFT.deploy(owner.address);
    await nft.waitForDeployment();

    // 铸造 NFT 给 owner
    await nft.mint(owner.address);

    // 部署市场合约
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy(await token.getAddress());
    await market.waitForDeployment();

    return { owner, buyer, token, nft, market };
  }

  it("should list and purchase an NFT using ERC20 token", async function () {
    const { owner, buyer, token, nft, market } = await loadFixture(deployFixture);

    // owner 授权 NFT 给市场
    await nft.connect(owner).approve(await market.getAddress(), 0);

    // 上架 NFT
    await expect(market.connect(owner).listNFT(await nft.getAddress(), 0, 100))
      .to.emit(market, "NFTListed")
      .withArgs(0, owner.address, await nft.getAddress(), 0, 100);

    // buyer 获取 ERC20 token
    await token.connect(owner).transfer(buyer.address, 200);
    expect(await token.balanceOf(buyer.address)).to.equal(200);

    // buyer 授权 ERC20 给市场
    await token.connect(buyer).approve(await market.getAddress(), 100);

    // 购买 NFT
    await expect(market.connect(buyer).buyNFT(0))
      .to.emit(market, "NFTPurchased")
      .withArgs(0, buyer.address);

    // 检查 NFT 所有者是 buyer
    expect(await nft.ownerOf(0)).to.equal(buyer.address);

    // 检查资金转移
    const total = await token.totalSupply();
    expect(await token.balanceOf(owner.address)).to.equal(total - 200n + 100n);
    expect(await token.balanceOf(buyer.address)).to.equal(100n);
  });
});