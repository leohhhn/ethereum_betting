const Betting = artifacts.require("Betting");

module.exports = function (deployer) {
  deployer.deploy(Betting, {value: 5000000000000000000}); // 5 eth deposit from contract owner
};
