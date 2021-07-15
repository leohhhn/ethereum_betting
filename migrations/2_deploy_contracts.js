const Betting = artifacts.require("Betting");

module.exports = function (deployer) {
  deployer.deploy(Betting, {value: 1000000000000000000}); // 1 eth deposit from contract owner
};
