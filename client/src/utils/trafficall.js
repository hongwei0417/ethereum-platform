import announce from "../contracts/Announce.json";
import { bytes32_to_string } from "./tools";
import { getContractInstance, contract_call } from "./getContract";
import Ownable from '../contracts/Ownable.json'

//取得使用者所有房間
export const get_all_ownable= async (Announce) => {
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
export const get_all_ownable_info= async (Announce) => {
	let result = [];
	let all_traffic_data = await Announce.methods.get_all_user().call();

	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i]; //ownable addr
		let traffic_data = await Announce.methods.get_user(all_traffic_data[0][i]).call();
		let traffic_data_destination = await Announce.methods.get_user_destination(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(traffic_data[1]);
		let traffic = bytes32_to_string(traffic_data[2]);
		let people = bytes32_to_string(traffic_data[3]);
		let money = parseInt(traffic_data[4]);
		let destination_lon = bytes32_to_string(traffic_data_destination[0]);
		let destination_lat = bytes32_to_string(traffic_data_destination[1]);
		result.push({
			traffic_id,
			traffic_addr,
			owner,
			name,
			dates,
			money,
			people,
			traffic,
			destination_lon,
			destination_lat
		});
	}
	return result;
};

//取得登入使用者所有房間
export const get_all_user_info= async (web3, all_ownable_data, user) => {
	let result = [];
	for(let i = 0; i < all_ownable_data.length; i++) {
		let ownable_instance = await getContractInstance(web3, Ownable, all_ownable_data[i].traffic_addr);
		let user_addr = await ownable_instance.methods.get_u().call();
		if(user_addr === user.address) {
			result.push(all_ownable_data[i]);
		}
	}
	return result;
};

//取得單獨揪團資訊
export const get_ownable_info= async (Announce) => {
	let result = [];
	let all_traffic_data = await Announce.methods.get_all_user().call();

	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i]; //ownable addr
		let traffic_data = await Announce.methods.get_user(all_traffic_data[0][i]).call();
		let traffic_data_destination = await Announce.methods.get_user_destination(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(traffic_data[1]);
		let money = bytes32_to_string(traffic_data[2]);
		let people = bytes32_to_string(traffic_data[3]);
		let traffic = bytes32_to_string(traffic_data[4]);
		let destination_lon = bytes32_to_string(traffic_data_destination[0]);
		let destination_lat = bytes32_to_string(traffic_data_destination[1]);
		result.push({
			traffic_id,
			traffic_addr,
			owner,
			name,
			dates,
			money,
			people,
			traffic,
			destination_lon,
			destination_lat
		});
	}
	return result;
};
