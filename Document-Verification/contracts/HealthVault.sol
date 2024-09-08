// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthVault {
    address public admin;

    struct Certificate {
        string certHash;  
        string cid;
        address issuer;    
        uint256 issuedAt;  
        bool isValid;      
        string publicKey; 
    }

    mapping(string => Certificate) private certificatesByCID;
    mapping(string => string) private cidByCertHash; 

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

    function revokeCertificate(string memory _cid) public onlyIssuer(_cid) {
        require(certificatesByCID[_cid].isValid, "Certificate is already revoked or doesn't exist");
        certificatesByCID[_cid].isValid = false;
    }

    function verifyByCID(string memory _cid) public view returns (bool) {
        return certificatesByCID[_cid].isValid;
    }

    function verifyByCertHash(string memory _certHash) public view returns (bool) {
        string memory cid = cidByCertHash[_certHash];
        return certificatesByCID[cid].isValid;
    }

    function transferAdminRights(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        admin = newAdmin;
    }

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
