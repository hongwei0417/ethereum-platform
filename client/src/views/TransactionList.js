import React from "react";
import TravelTab from "../components/TravelTab";
import { ListGroup, Table, Modal } from "react-bootstrap";
import Paper from "@material-ui/core/Paper";
import SearchBar from "../components/SearchBar";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_call } from "../utils/getContract";
import { get_txn_all_info } from "../utils/txn";
import TransactionManager from "../contracts/TransactionManager.json";
import Transaction from "../contracts/Transaction.json";
import eth_addr from "../eth_contract.json";
import moment from "moment";

export function TransactionList() {
	const [web3, set_web3] = React.useState(null);
	const [TM, set_TM] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [user, set_user] = React.useState(null);
	const [txn_time_list, set_txn_time_list] = React.useState([]);
	const [txn_addr_list, set_txn_addr_list] = React.useState([]);
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(false);

	//初始載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			if (web3) {
				set_web3(web3);
			}
		};
		load();
	}, []);

	//載入所有帳戶
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let accounts = await web3.eth.getAccounts();
				set_accounts(accounts);
			}
		};
		load();
	}, [web3]);

	//載入User
	React.useEffect(() => {
		let user_str = localStorage.getItem("user");
		if (user_str) {
			let user = JSON.parse(user_str);
			set_user(user);
		}
	}, [web3]);

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3 && user) {
				let TM = await getContractInstance(
					web3,
					TransactionManager,
					eth_addr.TransactionManager
				);
				set_TM(TM);
			}
		};
		load();
	}, [web3, user]);

	//載入使用者交易列表
	React.useEffect(() => {
		const load = async () => {
			if (TM) {
				let list = await contract_call(TM, "get_user_all_txns", [user.uid]);
				if (list) {
					set_txn_time_list(list[0]);
					set_txn_addr_list(list[1]);
				}
				console.log(list);
			}
		};
		load();
	}, [TM]);

	const open_modal = async (item, i) => {
		let txn_contract = await getContractInstance(web3, Transaction, item);
		let data = await get_txn_all_info(txn_contract);
		set_current_data({
			...data,
			time_id: txn_time_list[i],
		});
		set_open(true);
	};

	const close_modal = () => {
		set_open(false);
	};

	return (
		<div className="d-flex flex-column align-items-center pt-5">
			<div className="w-50">
				<TravelTab currentPage={3} />
			</div>
			<h3 className="text-white-50 mb-3">所有交易總覽</h3>
			<div className="w-50">
				<SearchBar />
				<hr color="white" />
				<Paper elevation={3}>
					<ListGroup>
						{txn_addr_list.map((item, i) => {
							return (
								<ListGroup.Item
									key={i}
									action
									variant="primary"
									style={{
										whiteSpace: "normal",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
									onClick={(e) => open_modal(item, i)}
								>
									{`【${item}】`}
								</ListGroup.Item>
							);
						})}
					</ListGroup>
				</Paper>
			</div>
			<Modal show={open} onHide={close_modal} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>{`${current_data.time_id} 【${current_data.sender}】`}</Modal.Title>
				</Modal.Header>
				<TxnDetails txn_data={current_data} />
			</Modal>
		</div>
	);
}

export function TxnDetails({ txn_data = {} }) {
	return (
		<Table striped bordered hover variant="dark" className="m-0">
			<thead>
				<tr>
					<th colSpan={4} className="text-center">
						{txn_data.complete ? "交易已完成" : "交易未完成"}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td colSpan={1}>{"交易創立者"}</td>
					<td colSpan={3}>{txn_data.sender}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"租方"}</td>
					<td colSpan={3}>{txn_data.renter}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"借方"}</td>
					<td colSpan={3}>{txn_data.borrower}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"交易物"}</td>
					<td colSpan={3}>{txn_data.lease}</td>
				</tr>
				<tr>
					<td>{"租方交易確認"}</td>
					<td>{txn_data.renter_check ? "已確認" : "尚未確認"}</td>
					<td>{"借方方交易確認"}</td>
					<td>{txn_data.borrower_check ? "已確認" : "尚未確認"}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"交易金額"}</td>
					<td colSpan={3} className="text-center">
						{txn_data.money}
					</td>
				</tr>
				<tr>
					<td>{"開始交易時間"}</td>
					<td>{moment(txn_data.start_time).toISOString()}</td>
					<td>{"結束交易時間"}</td>
					<td>
						{txn_data.end_time ? moment(txn_data.end_time).toISOString() : "尚未結束"}
					</td>
				</tr>
			</tbody>
		</Table>
	);
}
