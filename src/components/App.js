import { Route, Routes } from "react-router-dom";
import "../App.css";
import Data from "./Data/Data";
import Form from "./Form/form";
import Navbar from "./Navbar/Navbar";
import Option from "./Option/Option";
import Sidebar from "./Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  loadAccount,
  loadAllData,
  loadMedical,
  loadNetwork,
  loadProvider,
  subscribeToEvents,
} from "../store/interactions";
import config from "../config.json";
import Alert from "./Alert/Alert";
function App() {
  const dispatch = useDispatch();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };
  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);
    console.log(chainId)
    const medical_config = config[chainId].medical;
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    const medical = loadMedical(provider, medical_config.address, dispatch);
    loadAllData(provider, medical, dispatch);
    subscribeToEvents(medical, dispatch);
  };
  useEffect(() => {
    loadBlockchainData();
  });
  return (
    <div className="App">
      <div className="navbar">
        <Navbar />
        <button className="hamburger-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />
        <Routes>
          <Route path="/Form" exact element={<Form />} />
          <Route path="/Data" element={<Data />} />
        </Routes>
        <Alert />
      </div>
    </div>
  );
}

export default App;