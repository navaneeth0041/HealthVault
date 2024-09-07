import React from "react";
import "./navbar.css";
import healthReport from "../../assets/file.png";
import { loadAccount } from "../../store/interactions";
import { useDispatch, useSelector } from "react-redux";
import Blockies from "react-blockies";
import config from "../../config.json";

const Navbar = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);
  const chainId = useSelector((state) => state.provider.chainId);
  const connectHandler = async (e) => {
    if (!provider) {
      console.error("Provider is not loaded");
      return;
    }

    try {
      await loadAccount(provider, dispatch);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  const networkHandler = async (e) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${parseInt(e.target.value, 10).toString(16)}`,
          },
        ],
      });
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };
  return (
    <div className="Navbar">
      <div className="nav__name">
        <img src={healthReport} width="150" height="150" alt="" />
        <h2>Decentralized Care,<br/>   Centralized Trust</h2>
      </div>
      <div className="nav__networkSelector">
        <select
          name="network"
          id="network"
          onChange={networkHandler}
          value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
        >
          <option value="0" disabled>
            Select Network
          </option>
          <option value="31337">Localhost</option>
          <option value="11155111">Sepolia</option>
        </select>
      </div>
      <div className="nav__balance">
        {balance ? (
          <p className="nav__myBalance">
            <small>My Balance : </small>
            {Number(balance).toFixed(4)}
          </p>
        ) : (
          <p className="nav__myBalance">
            <small>My Balance : </small>
            0ETH
          </p>
        )}
        {account ? (
          <a className="nav__myAccount" href="#">
            {account.slice(0, 5) + "...." + account.slice(38, 42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon"
            />
          </a>
        ) : (
          <button className="nav__balance-box" onClick={connectHandler}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
