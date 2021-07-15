const Betting = artifacts.require("Betting");

module.exports = function (deployer) {
  deployer.deploy(Betting, {value: 30000000000000000000}); // 30 eth deposit from contract owner
};
