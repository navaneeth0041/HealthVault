// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthVault {
    address public admin;

    struct Certificate {
        string certHash;   // Hash of the certificate
        string cid;        // CID of the file stored on IPFS
        address issuer;    // Address of the issuer
        uint256 issuedAt;  // Timestamp of issuance
        bool isValid;      // Validity status of the certificate
        string publicKey;  // Public key associated with the certificate
    }

    mapping(string => Certificate) private certificatesByCID;
    mapping(string => string) private cidByCertHash;  // Map certHash -> CID for verification

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyIssuer(string memory _cid) {
        require(certificatesByCID[_cid].issuer == msg.sender, "Only issuer can revoke");
        _;
    }

    // Function to check if a certificate exists by CID
    function certificateExists(string memory _cid) public view returns (bool) {
        return certificatesByCID[_cid].issuedAt != 0;
    }


    function issueCertificate(string memory _cid, string memory _certHash, string memory _publicKey) public {
        require(certificatesByCID[_cid].issuedAt == 0, "Certificate already exists for this CID");

        certificatesByCID[_cid] = Certificate({
            certHash: _certHash,
            cid: _cid,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            isValid: true,
            publicKey: _publicKey
        });

        cidByCertHash[_certHash] = _cid;
    }

    // Function to revoke a certificate by the issuer
    function revokeCertificate(string memory _cid) public onlyIssuer(_cid) {
        require(certificatesByCID[_cid].isValid, "Certificate is already revoked or doesn't exist");
        certificatesByCID[_cid].isValid = false;
    }

    // Function to verify if a certificate is valid by CID
    function verifyByCID(string memory _cid) public view returns (bool) {
        return certificatesByCID[_cid].isValid;
    }

    // Function to verify if a certificate is valid by certificate hash
    function verifyByCertHash(string memory _certHash) public view returns (bool) {
        string memory cid = cidByCertHash[_certHash];
        return certificatesByCID[cid].isValid;
    }

    // Function to transfer admin rights to a new address
    function transferAdminRights(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        admin = newAdmin;
    }

    // Function to get certificate details by CID
    function getCertificateDetails(string memory _cid) public view returns (
        string memory certHash, 
        address issuer, 
        uint256 issuedAt, 
        bool isValid, 
        string memory publicKey
    ) {
        Certificate memory cert = certificatesByCID[_cid];
        require(cert.issuedAt != 0, "Certificate does not exist");
        return (cert.certHash, cert.issuer, cert.issuedAt, cert.isValid, cert.publicKey);
    }
}
