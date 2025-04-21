import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTMarketModule", (m) => {
  // 部署 ERC20 代币
  const token = m.contract("MyToken");

  // 部署 NFT 合约，传入 initialOwner 参数
  const nft = m.contract("MyNFT", [m.getAccount(0)]);

  // 部署市场合约，传入 token 地址
  const market = m.contract("NFTMarket", [token]);

  return { token, nft, market };
});