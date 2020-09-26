import { getContractInstance } from "./getContract";
import announce from "../contracts/Announce.json";
import { bytes32_to_string } from "./tools";
import { contract_call } from "./getContract";

//取得使用者所有發布
// export const get_all_user = async (web3, uid, Announce) => {
// 	let result = [];
// 	let all_traffic_data = await Announce.methods.get_all_user(uid).call();
// console.log(uid);
// 	for (let i = 0; i < all_traffic_data[1].length; i++) {
// 		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
// 		let traffic_addr = all_traffic_data[1][i];
// 		let traffic_instance = await getContractInstance(web3, announce, traffic_addr);
// 		let owner = bytes32_to_string(uid);
// 		let name = await traffic_instance.methods.name().call();
// 		let dates = parseInt(await traffic_instance.methods.dates().call()) * 1000;
// 		let money = parseInt(await traffic_instance.methods.money().call());
// 		let people = parseInt(await traffic_instance.methods.people().call());
// 		let destination = await traffic_instance.methods.destination().call();
// 		let traffic = await traffic_instance.methods.traffic().call();

// 		result.push({
// 			traffic_id,
// 			traffic_addr,
// 			owner,
// 			name,
// 			dates,
// 			money,
// 			people,
// 			destination,
// 			traffic,
// 		});
// 	}
// 	return result;
// };

//取得使用者所有房間
export const get_all_user= async (Announce) => {
	let result = [];
	let all_traffic_data = await Announce.methods.get_all_user().call();

	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i];
		// let traffic_instance = await getContractInstance(web3, announce, traffic_addr);
		// let traffic_data = await contract_call(traffic_instance, "get_all_info", []);
		// let owner = bytes32_to_string(user.uid);
		// let owner_addr = user.address || traffic_data[0];
		debugger

		result.push({
			traffic_id,
			traffic_addr,
			// owner,
			// owner_addr,
		});
	}
	return result;
};