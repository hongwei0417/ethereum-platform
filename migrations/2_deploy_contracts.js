const UserManager = artifacts.require("UserManager");
const AccountManager = artifacts.require("AccountManager");
const LeaseManager = artifacts.require("RoomManager");
const TransactionManager = artifacts.require("TransactionManager");
const Tool = artifacts.require("Tool");
const Global = artifacts.require("Global");
const CouponManager = artifacts.require("CouponManager");
const Auth = artifacts.require("Auth");

var fs = require("fs");
var file_path = `${__dirname}/../client/src/eth_contract.json`;
var eth_contract = require(file_path);
var OAR = "0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475";

module.exports = function (deployer, network, accounts) {
	var UM, ACM, RM, TM, TL, GLOBAL, CM, AUTH;
	deployer
		.then(function () {
			return deployer.deploy(UserManager);
		})
		.then(function (instance) {
			UM = instance.address;
			eth_contract.UserManager = UM;
			return deployer.deploy(AccountManager);
		})
		.then(function (instance) {
			ACM = instance.address;
			eth_contract.AccountManager = ACM;
			return deployer.deploy(LeaseManager);
		})
		.then(function (instance) {
			RM = instance.address;
			eth_contract.RoomManager = RM;
			return deployer.deploy(TransactionManager);
		})
		.then(function (instance) {
			TM = instance.address;
			eth_contract.TransactionManager = TM;
			return deployer.deploy(Tool);
		})
		.then(function (instance) {
			TL = instance.address;
			eth_contract.Tool = TL;
			return deployer.deploy(Global, accounts[0], UM, ACM, RM, TM, TL, OAR);
		})
		.then(function (instance) {
			GLOBAL = instance.address;
			eth_contract.Global = GLOBAL;
			return deployer.deploy(CouponManager, GLOBAL);
		})
		.then(function (instance) {
			CM = instance.address;
			eth_contract.CouponManager = CM;
			return deployer.deploy(Auth, GLOBAL);
		})
		.then(function (instance) {
			AUTH = instance.address;
			eth_contract.Auth = AUTH;

			fs.writeFile(file_path, JSON.stringify(eth_contract), function (err) {
				if (err) return console.log(err);
				console.log(JSON.stringify(eth_contract));
				console.log("writing to " + file_path);
			});
		});
};
