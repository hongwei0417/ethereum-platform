import { contract_call } from "./getContract";
export const get_txn_all_info = async (txn_contract) => {
	let txn_info = await contract_call(txn_contract, "get_txn_info");
	let txn_status = await contract_call(txn_contract, "get_txn_status");
	let txn_times = await contract_call(txn_contract, "get_txn_times");
	let txn_money = await contract_call(txn_contract, "get_txn_money");

	let sender = txn_info[0];
	let renter = txn_info[1];
	let borrower = txn_info[2];
	let lease = txn_info[3];
	let renter_check = txn_status[0];
	let borrower_check = txn_status[1];
	let complete = txn_status[2];
	let start_time = parseInt(txn_times[0]) * 1000;
	let end_time = parseInt(txn_times[1]) * 1000;
	let money = txn_money;

	return {
		sender,
		renter,
		borrower,
		lease,
		renter_check,
		borrower_check,
		complete,
		start_time,
		end_time,
		money,
	};
};
