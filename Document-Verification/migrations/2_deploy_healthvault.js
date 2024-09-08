const HealthVault = artifacts.require("HealthVault");

module.exports = function (deployer) {
  deployer.deploy(HealthVault);
};
