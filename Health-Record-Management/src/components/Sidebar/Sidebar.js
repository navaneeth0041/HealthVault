import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ isVisible, onClose }) => {
  return (
    <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
      <button className="close-btn" onClick={onClose}>
        x
      </button>
      <h2>HealthVault</h2>
      <ul>
        <li><Link to="/" onClick={onClose}>Home</Link></li>
        <li><Link to="/Form" onClick={onClose}>New Patient</Link></li>
        <li><Link to="/Data" onClick={onClose}>Records</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
