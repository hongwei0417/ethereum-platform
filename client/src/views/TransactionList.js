import React from "react";
import TravelTab from "../components/TravelTab";
import { ListGroup, Table, Modal } from "react-bootstrap";
import Paper from "@material-ui/core/Paper";
import SearchBar from "../components/SearchBar";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_call } from "../utils/getContract";
import TransactionManager from "../contracts/TransactionManager.json";
import Transaction from "../contracts/Transaction.json";
import eth_addr from "../eth_contract.json";

export function TransactionList() {
	const [web3, set_web3] = React.useState(null);
	const [TM, set_TM] = React.useState(null);
	const [txn_contract, set_txn_contract] = React.useState(null);
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
				let instance1 = await getContractInstance(
					web3,
					TransactionManager,
					eth_addr.TransactionManager
				);
				let instance2 = await getContractInstance(web3, Transaction, user.address);
				set_TM(instance1);
				set_txn_contract(instance2);
			}
		};
		load();
	}, [web3, user]);

	//載入使用者交易列表
	React.useEffect(() => {
		const load = async () => {
			if (TM && txn_contract) {
				let list = await contract_call(TM, "get_user_all_txns", [user.uid]);
				if (list) {
					set_txn_time_list(list[0]);
					set_txn_addr_list(list[1]);
				}
			}
		};
		load();
	}, [TM, txn_contract]);

	const open_modal = (item) => {
		set_current_data(item);
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
				<Paper elevation={3} className="w-50">
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
									onClick={(e) => open_modal(item)}
								>
									{`【${item.lease_id}】`}
								</ListGroup.Item>
							);
						})}
					</ListGroup>
				</Paper>
			</div>
			<Modal show={open} onHide={close_modal} centered>
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>{`${current_data.time} 【${current_data.sender}】`}</Modal.Title>
				</Modal.Header>
				<TxnDetails />
			</Modal>
		</div>
	);
}

export function TxnDetails({}) {
	return (
		<Table striped bordered hover variant="dark" className="m-0">
			<thead>
				<tr>
					<th>#</th>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Username</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1</td>
					<td>Mark</td>
					<td>Otto</td>
					<td>@mdo</td>
				</tr>
				<tr>
					<td>2</td>
					<td>Jacob</td>
					<td>Thornton</td>
					<td>@fat</td>
				</tr>
				<tr>
					<td>3</td>
					<td colSpan="2">Larry the Bird</td>
					<td>@twitter</td>
				</tr>
			</tbody>
		</Table>
	);
}
