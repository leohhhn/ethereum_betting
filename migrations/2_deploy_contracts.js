const Betting = artifacts.require("Betting");

module.exports = function (deployer) {
  deployer.deploy(Betting, {value: 3000000000000000000});
};
