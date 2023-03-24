import React, { useState, useEffect } from "react";
import Web3 from "web3";
import AssetToken from "./contracts/AssetToken.json";

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const contractAddress = "0x4346d736fdbfeC9734880E43AA0751E4EF39dd05";

function App() {
  const [account, setAccount] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    const loadTokenBalance = async () => {
      const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);
      const balance = await contract.methods.balanceOf(account).call();
      setTokenBalance(balance);
    };

    const loadAssetCount = async () => {
      const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);
      const assetCount = await contract.methods.assets(account).call();
      setAssetCount(assetCount);
    };

    const loadRewardBalance = async () => {
      const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);
      const rewardBalance = await contract.methods.rewardPool().call();
      setRewardBalance(rewardBalance);
    };

    setLoading(true);
    setError(null);

    loadAccount()
      .then(() => loadTokenBalance())
      .then(() => loadAssetCount())
      .then(() => loadRewardBalance())
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [account]);

  const handleDeposit = async (amount) => {
    setLoading(true);
    setError(null);

    const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);
    await contract.methods.deposit(amount).send({ from: account });

    setLoading(false);
    window.location.reload();
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    setError(null);

    const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);
    const assetCount = await contract.methods.assets(account).call();
    const startIndex = 0;
    const endIndex = assetCount;
    await contract.methods.claimRewards(startIndex, endIndex).send({ from: account });

    setLoading(false);
    window.location.reload();
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : null}
      {error ? <p>Error: {error}</p> : null}
      {account ? <p>Connected account: {account}</p> : null}
      <p>Token balance: {tokenBalance}</p>
      <p>Asset count: {assetCount}</p>
      <p>Reward balance: {rewardBalance}</p>
      <button onClick={() => handleDeposit(10)}>Deposit 10 tokens</button>
      <button onClick={() => handleDeposit(20)}>Deposit 20 tokens</button>
      <button onClick={() => handleClaimRewards()}>Claim rewards</button>
    </div>
  );
}

export default App;
