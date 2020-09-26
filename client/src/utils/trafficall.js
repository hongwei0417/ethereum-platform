import { getContractInstance } from "./getContract";
import announce from "../contracts/Announce.json";
import { bytes32_to_string } from "./tools";
import { contract_call } from "./getContract";

//取得使用者所有房間
export const get_all_user= async (Announce) => {
	let result = [];
	let all_traffic_data = await Announce.methods.get_all_user().call();

	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i];
		result.push({
			traffic_id,
			traffic_addr,
		});
	}
	return result;
};

//取得使用者所有房間
export const get_user_info= async (Announce) => {
	let result = [];
	let all_traffic_data = await Announce.methods.get_all_user().call();

	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i];
		let traffic_data = await Announce.methods.get_user(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]);
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(bytes32_to_string(traffic_data[1])) * 1000;
		let money = bytes32_to_string(traffic_data[2]);
		let people = bytes32_to_string(traffic_data[3]);
		let destination = bytes32_to_string(traffic_data[4]);
		let traffic = bytes32_to_string(traffic_data[5]);
		result.push({
			traffic_id,
			traffic_addr,
			owner,
			name,
			dates,
			money,
			people,
			destination,
			traffic,
		});
	}
	return result;
};


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