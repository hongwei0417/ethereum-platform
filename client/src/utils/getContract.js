export const getContractInstance = async (web3, contractDefinition, address) => {
	// get network ID and the deployed address
	const networkId = await web3.eth.net.getId();
	const deployedAddress = address || contractDefinition.networks[networkId].address;

	// create the instance
	const instance = new web3.eth.Contract(contractDefinition.abi, deployedAddress);
	return instance;
};
