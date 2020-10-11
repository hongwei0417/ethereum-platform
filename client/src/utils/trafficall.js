import { bytes32_to_string } from "./tools";
import { getContractInstance, contract_call } from "./getContract";
import Announce from '../contracts/Announce.json'
import announceManager from '../contracts/AnnounceManager.json'
import TrafficTransaction from '../contracts/TrafficTransaction.json'

// //取得使用者所有貼文
// export const get_all_user_announce= async (Announce) => {
// 	let result = [];
// 	let all_traffic_data = await Announce.methods.get_all_user().call();

// 	for (let i = 0; i < all_traffic_data[1].length; i++) {
// 		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
// 		let traffic_addr = all_traffic_data[1][i];
// 		result.push({
// 			traffic_id,
// 			traffic_addr,
// 		});
// 	}
// 	return result;
// };

//取得所有貼文
export const get_all_announce_info= async (announceManager) => {
	let result = [];
	let all_traffic_data = await announceManager.methods.get_all_announces().call({
		gas: 6000000,
	});
	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i]; //ownable addr
		let traffic_data = await announceManager.methods.get_announce(all_traffic_data[0][i]).call();
		let traffic_data_destination = await announceManager.methods.get_announce_destination(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(traffic_data[1]);
		let traffic = bytes32_to_string(traffic_data[2]);
		let people = parseInt(traffic_data[3]);
		let people_count = parseInt(traffic_data[4]);
		let money = parseInt(traffic_data[5]);
		let destination_lon = bytes32_to_string(traffic_data_destination[0]);
		let destination_lat = bytes32_to_string(traffic_data_destination[1]);
		let u = traffic_data_destination[2];
		result.push({
			traffic_id,
			traffic_addr,
			owner,
			name,
			dates,
			money,
			people,
			people_count,
			traffic,
			destination_lon,
			destination_lat,
			u
		});
	}
	return result;
};


// //取得所有貼文
// export const get_all_user_announce_info= async (announceManager) => {
// 	let result = [];
// 	let all_traffic_data = await announceManager.methods.get_all_announces().call({
// 		gas: 6000000,
// 	});
// 	for (let i = 0; i < all_traffic_data[1].length; i++) {
// 		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
// 		let traffic_addr = all_traffic_data[1][i]; //ownable addr
// 		let traffic_data = await announceManager.methods.get_announce(all_traffic_data[0][i]).call();
// 		let traffic_data_destination = await announceManager.methods.get_announce_destination(all_traffic_data[0][i]).call();
// 		let traffic_data_destination1 = await announceManager.methods.get_confirm_user_announce(all_traffic_data[0][i]).call();
// 		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
// 		let name =  bytes32_to_string(traffic_data[0]);
// 		let dates = parseInt(traffic_data[1]);
// 		let traffic = bytes32_to_string(traffic_data[2]);
// 		let people = parseInt(traffic_data[3]);
// 		let people_count = parseInt(traffic_data[4]);
// 		let money = parseInt(traffic_data[5]);
// 		let destination_lon = bytes32_to_string(traffic_data_destination[0]);
// 		let destination_lat = bytes32_to_string(traffic_data_destination[1]);
// 		let u = traffic_data_destination[2];
// 		let u1 = traffic_data_destination1[0];
// 		result.push({
// 			traffic_id,
// 			traffic_addr,
// 			owner,
// 			name,
// 			dates,
// 			money,
// 			people,
// 			people_count,
// 			traffic,
// 			destination_lon,
// 			destination_lat,
// 			u,
// 			u1
// 		});
// 	}
// 	return result;
// };

//取得登入使用者所有文章
export const get_all_user_info= async (web3, announce_list, user) => {
	let result = [];
	for(let i = 0; i < announce_list.length; i++) {
		let announce_instance = await getContractInstance(web3, Announce, announce_list[i].traffic_addr);
		let user_addr = await announce_instance.methods.get_u().call();
		if(user_addr === user.address) {
			result.push(announce_list[i]);
		}
	}
	return result;
};


//取得登入使用者跟單
export const get_all_user_confirm_info= async (web3, announce_list, user) => {
	let result = [];
	for(let i = 0; i < announce_list.length; i++) {
		let announce_instance = await getContractInstance(web3, TrafficTransaction, announce_list[i].traffic_addr);
		let user_addr = await announce_instance.methods.get_u().call();
		if(user_addr === user.address) {
			result.push(announce_list[i]);
		}
	}
	return result;
};

