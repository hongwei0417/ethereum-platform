const Auth = artifacts.require("Auth");
const Announce = artifacts.require("Announce");

module.exports = function (deployer) {
	deployer.deploy(Auth);
	deployer.deploy(Announce);
};
