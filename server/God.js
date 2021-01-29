import createClient from "ipfs-http-client";
import { getContractInstance, contract_call } from "../client/src/utils/getContract";
import { connect_to_web3 } from "../client/src/utils/getWeb3";
import txn_manager_contract_ABI from "../client/src/contracts/User.json";

async function create_off_chain_txn(
	txn_manager_addr,
	room_addr,
	user_addr,
	hotelier_addr,
	txn_data
) {
	const web3 = await connect_to_web3();
	const client = createClient("http://127.0.0.1:5001");
	const txn_manager_contract = getContractInstance(
		web3,
		txn_manager_contract_ABI,
		txn_manager_addr
	);
	try {
		const data = { room_addr, user_addr, hotelier_addr, txn_data };
		const { cid } = await client.add(data);
		const txn_params = [cid, room_addr, user_addr, hotelier_addr, ...txn_data.txn_info];
		const result = await contract_call(txn_manager_contract, "set_IPFS_hash", txn_params);
		if (result) {
			return { status: true, msg: "create_txn_success" };
		} else {
			return { status: false, msg: "create_txn_fail" };
		}
	} catch (e) {
		return { status: false, msg: "create_txn_fail" };
	}
}

create_off_chain_txn();
