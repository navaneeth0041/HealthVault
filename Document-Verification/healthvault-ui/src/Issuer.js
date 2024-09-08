import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import HealthVaultContract from './HealthVault.json';
import { create as ipfsClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import {
    Button,
    Typography,
    Box,
    TextField,
    CircularProgress,
    Paper,
    Grid,
    IconButton,
    Avatar,
    styled
} from '@mui/material';
import { CloudUpload, VerifiedUser } from '@mui/icons-material';

const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

const PulseButton = styled(Button)(({ theme, loading }) => ({
    position: 'relative',
    backgroundColor: loading ? theme.palette.primary.dark : theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'translate(-50%, -50%) scale(0.8)',
        animation: loading ? 'pulse 1.5s infinite' : 'none',
    },
    '@keyframes pulse': {
        '0%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 1 },
        '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0 },
        '100%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 1 },
    },
}));

const Issuer = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [file, setFile] = useState(null);
    const [cid, setCid] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileSelected, setFileSelected] = useState(true); // New state variable

    useEffect(() => {
        const loadWeb3 = async () => {
            const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
            setWeb3(web3Instance);
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);
            const networkId = await web3Instance.eth.net.getId();
            const deployedNetwork = HealthVaultContract.networks[networkId];
            const contractInstance = new web3Instance.eth.Contract(
                HealthVaultContract.abi,
                deployedNetwork && deployedNetwork.address
            );
            setContract(contractInstance);
        };

        loadWeb3();
    }, []);

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileSelected(!!selectedFile); // Set fileSelected based on whether a file is chosen
    };

    const uploadToIPFS = async () => {
        if (!file) {
            setStatus('No file selected.');
            setFileSelected(false); // Set to false if no file
            return;
        }
        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const arrayBuffer = reader.result;
                const fileBuffer = new Uint8Array(arrayBuffer);
                const added = await ipfs.add(fileBuffer);
                setCid(added.path);
                setStatus('File uploaded to IPFS successfully.');
                setFileSelected(true); // Reset fileSelected if upload is successful
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error uploading file: ', error);
            setStatus('Error uploading file to IPFS.');
        } finally {
            setLoading(false);
        }
    };

    const issueCertificate = async () => {
        if (contract && file && cid) {
            setLoading(true);
            try {
                const fileBuffer = await file.arrayBuffer();
                const publicKeyBuffer = new TextEncoder().encode('HealthVaultKey');
                const combinedBuffer = new Uint8Array(fileBuffer.byteLength + publicKeyBuffer.byteLength);
                combinedBuffer.set(new Uint8Array(fileBuffer), 0);
                combinedBuffer.set(publicKeyBuffer, fileBuffer.byteLength);

                const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                await contract.methods.issueCertificate(cid, fileHash, 'HealthVaultKey').send({ from: account, gas: 3000000 });
                setStatus('Certificate issued successfully.');
            } catch (error) {
                console.error('Error issuing certificate:', error);
                setStatus('Error issuing certificate: A certificate already exists with this certificate number');
            } finally {
                setLoading(false);
            }
        } else {
            setStatus('Upload file and generate keys first.');
        }
    };

    return (
        <Paper elevation={10} sx={{ padding: '80px', maxWidth: '600px', width: '100%', borderRadius: '16px' }}>
            <Box textAlign="center" mb={3}>
                <Avatar sx={{ bgcolor: '#007bff', width: 56, height: 56, margin: '0 auto' }}>
                    <VerifiedUser fontSize="large" />
                </Avatar>
                <Typography variant="h4" gutterBottom>
                    Issuer Dashboard
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Upload Certificate
                </Typography>

            </Box>
            <Box mt={3}>
            <Grid container spacing={3} justifyContent="center">
    <Grid item xs={12} textAlign="center">
        <TextField
            fullWidth
            type="file"
            onChange={handleFileUpload}
            variant="outlined"
            label=""
            InputProps={{
                endAdornment: (
                    <IconButton edge="end" disabled>
                        <CloudUpload />
                    </IconButton>
                ),
            }}
        />
    </Grid>
    <Grid item xs={12} textAlign="center">
        <PulseButton
            variant="contained"
            color="primary"
            onClick={uploadToIPFS}
            disabled={loading || !file}
            size="large"
            loading={loading}
        >
            {loading ? <CircularProgress size={24} /> : 'Upload to IPFS'}
        </PulseButton>
    </Grid>
    <Grid item xs={12} textAlign="center">
        <Button
            variant="contained"
            color="secondary"
            onClick={issueCertificate}
            disabled={loading || !cid}
            size="large"
            sx={{ borderRadius: '8px', padding: '10px 40px' }}
        >
            {loading ? <CircularProgress size={24} /> : 'Issue Certificate'}
        </Button>
    </Grid>
</Grid>

            </Box>

            {cid && (
                <Box mt={3} textAlign="center">
                    <Typography variant="h6">Certificate Number (CID):</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all', fontWeight: 'bold' }}>{cid}</Typography>
                </Box>
            )}

            {status && (
                <Box mt={3} textAlign="center">
                    <Typography variant="body1" color={status.includes('Error') ? "red" : "green"}>
                        {status}
                    </Typography>
                </Box>
            )}
            {!fileSelected && !loading && (
                <Box mt={3} textAlign="center">
                    <Typography variant="body1" color="red">
                        No file selected.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default Issuer;
