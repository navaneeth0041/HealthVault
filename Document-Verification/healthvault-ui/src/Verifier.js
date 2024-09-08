import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import HealthVaultContract from './HealthVault.json';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Grid } from '@mui/material';

const Verifier = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [cid, setCID] = useState(''); 
    const [file, setFile] = useState(null); 
    const [isValid, setIsValid] = useState(null); 
    const [status, setStatus] = useState('');
    const [publicKey, setPublicKey] = useState(''); 
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        const loadWeb3 = async () => {
            const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
            setWeb3(web3Instance);
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);
            const networkId = await web3Instance.eth.net.getId();
            const deployedNetwork = HealthVaultContract.networks[networkId];

            if (deployedNetwork) {
                const contractInstance = new web3Instance.eth.Contract(
                    HealthVaultContract.abi,
                    deployedNetwork.address
                );
                setContract(contractInstance);
            } else {
                setStatus('Smart contract not deployed on the current network.');
            }
        };

        loadWeb3();
    }, []);

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const verifyCertificate = async () => {
        if (contract && cid && file) {
            setLoading(true);
            try {
                const exists = await contract.methods.certificateExists(cid).call();
                if (!exists) {
                    throw new Error("Certificate does not exist.");
                }

                const cert = await contract.methods.getCertificateDetails(cid).call();

                if (!cert.isValid) {
                    throw new Error("Certificate is invalid or revoked.");
                }

                setPublicKey(cert.publicKey);
                const publicKeyBuffer = new TextEncoder().encode(cert.publicKey);

                const fileBuffer = await file.arrayBuffer();
                const combinedBuffer = new Uint8Array(fileBuffer.byteLength + publicKeyBuffer.byteLength);
                combinedBuffer.set(new Uint8Array(fileBuffer), 0);
                combinedBuffer.set(publicKeyBuffer, fileBuffer.byteLength);

                const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const combinedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (combinedHash === cert.certHash) {
                    setIsValid(true);
                    setStatus('Certificate is valid.');
                } else {
                    setIsValid(false);
                    setStatus('Certificate hash does not match.');
                }
            } catch (error) {
                console.error('Error verifying certificate:', error);
                setStatus('Certificate with this certificate number does not exist.');
            } finally {
                setLoading(false);
            }
        } else {
            setStatus('Please upload a file and enter a valid CID.');
        }
    };

    return (
        <Box p={3}>
            <Paper elevation={4} sx={{ padding: '20px', maxWidth: '600px', margin: 'auto', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ color: '#3f51b5' }}>
                    Verifier Dashboard
                </Typography>
                <Box mt={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Certificate CID"
                                variant="outlined"
                                value={cid}
                                onChange={(e) => setCID(e.target.value)}
                                sx={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="label"
                                fullWidth
                                sx={{ backgroundColor: '#3f51b5', '&:hover': { backgroundColor: '#303f9f' } }}
                            >
                                Upload Certificate File
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12} textAlign="center">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={verifyCertificate}
                                fullWidth
                                disabled={loading}
                                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Verify Certificate'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {status && (
                    <Box mt={3} textAlign="center">
                        <Typography variant="body1" color={isValid ? "green" : "red"} sx={{ fontWeight: 'bold' }}>
                            {status}
                        </Typography>
                    </Box>
                )}

                {publicKey && (
                    <Box mt={3} textAlign="center">
                        <Typography variant="h6" color={isValid ? "green" : "red"}>
                            {isValid ? "Verification Successful!" : "Verification Not Successful!"}
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'gray' }}>
                            {/*  here */}
                        </Typography>
                    </Box>
                )}

                {isValid !== null && (
                    <Box mt={3} textAlign="center">
                        <Typography variant="h6" color={isValid ? "green" : "red"}>
                            {isValid ? 'Valid Certificate' : 'Invalid Certificate'}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Verifier;
