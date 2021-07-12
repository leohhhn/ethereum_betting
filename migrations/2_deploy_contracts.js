const Betting = artifacts.require("Betting");

module.exports = function (deployer) {
  deployer.deploy(Betting, {value: 3000000000000000000}); // 3 eth deposit from contract owner
};
