import { getContractInstance } from "./getContract";
import lease from "../contracts/Lease.json";
import { bytes32_to_string } from "./tools";
import moment from "moment";

//取得使用者所有房間
export const get_user_all_lease_info = async (web3, uid, leaseManager) => {
	let result = [];
	let all_leases_data = await leaseManager.methods.get_user_all_leases(uid).call();

	for (let i = 0; i < all_leases_data[1].length; i++) {
		let lease_id = bytes32_to_string(all_leases_data[0][i]);
		let lease_addr = all_leases_data[1][i];
		let lease_instance = await getContractInstance(web3, lease, lease_addr);
		let owner = bytes32_to_string(uid);
		let house_name = await lease_instance.methods.house_name().call();
		let category = await lease_instance.methods.category().call();
		let rented_out = await lease_instance.methods.rented_out().call();
		let start_time = parseInt(await lease_instance.methods.start_time().call()) * 1000;
		let end_time = parseInt(await lease_instance.methods.end_time().call()) * 1000;
		let price = parseInt(await lease_instance.methods.price().call());
		let quantity = parseInt(await lease_instance.methods.quantity().call());
		let lon = await lease_instance.methods.lon().call();
		let lat = await lease_instance.methods.lat().call();

		result.push({
			lease_id,
			lease_addr,
			owner,
			house_name,
			category,
			rented_out,
			start_time,
			end_time,
			price,
			quantity,
			lon,
			lat,
		});
	}
	return result;
};
