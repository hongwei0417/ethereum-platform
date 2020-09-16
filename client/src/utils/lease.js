import { getContractInstance } from "./getContract";
import lease from "../contracts/Lease.json";
import { bytes32_to_string } from "./tools";

//取得使用者所有房間
export const get_all_lease_info = async (web3, uid, leaseManager) => {
	let result = [];
	let all_leases_data = await leaseManager.methods.get_user_all_leases(uid).call();

	for (let i = 0; i < all_leases_data[1].length; i++) {
		let lease_instance = await getContractInstance(web3, lease, all_leases_data[1][i]);
		let owner = bytes32_to_string(uid);
		let house_name = bytes32_to_string(all_leases_data[0][i]);
		let category = await lease_instance.methods.category().call();
		let rented_out = await lease_instance.methods.rented_out().call();
		let start_time = await lease_instance.methods.start_time().call();
		let end_time = await lease_instance.methods.end_time().call();
		let price = await lease_instance.methods.price().call();
		let quantity = await lease_instance.methods.quantity().call();

		result.push({
			owner,
			house_name,
			category,
			rented_out,
			start_time,
			end_time,
			price,
			quantity,
		});
	}
	return result;
};
