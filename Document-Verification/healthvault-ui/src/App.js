import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Issuer from './Issuer';
import Verifier from './Verifier';
import './App.css'; 

function App() {
    return (
        <Router>
            <div className="app-container">
                <div className="content">
                    <h1 className="title">Health Vault</h1>
                    <div className="buttons-container">
                        <Link to="/issuer" className="button">Issue Certificate</Link>
                        <Link to="/verifier" className="button">Verify Certificate</Link>
                    </div>
                </div>

                <Routes>
                    <Route path="/issuer" element={<Issuer />} />
                    <Route path="/verifier" element={<Verifier />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
