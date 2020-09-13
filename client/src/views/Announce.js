import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, FormControl, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import Announce_Contract from "../contracts/Auth.json";

export function Announce({}) {
	const [name, set_name] = React.useState("");
	const [dates, set_dates] = React.useState("");
	const [destination, set_destination] = React.useState("");
	const [traffic, set_traffic] = React.useState("");
	const [people, set_people] = React.useState("");
	const [money, set_money] = React.useState("");
	const [select_account, set_select_account] = React.useState(null);
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [announce_contract, set_announce_contract] = React.useState(null);

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

	//更新帳戶資料
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let accounts = await web3.eth.getAccounts();
				set_accounts(accounts);
			}
		};
		load();
	}, [web3]);

	//更新智能合約
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let contract = await getContractInstance(web3, Announce_Contract);
				set_announce_contract(contract);
			}
		};
		load();
	}, [web3]);

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
			case "name":
				set_name(value);
				break;
			case "dates":
				set_dates(value);
				break;
			case "destination":
				set_destination(value);
				break;
			case "traffic":
				set_traffic(value);
				break;
			case "people":
				set_people(value);
				break;
			case "money":
				set_money(value);
				break;
			default:
				break;
		}
	};


	//發布訊息
	const onSubmit = async () => {
		if (!web3) {
			alert("web3未載入!");
			return;
		}
		if (accounts.length === 0) {
			alert("區塊鏈上沒有任何帳戶!");
			return;
		}
		if (!select_account) {
			alert("請選擇帳戶!");
			return;
		}
		if (!name) {
			alert("請輸入姓名!");
			return;
		}
		if (!dates) {
			alert("請輸入日期!");
			return;
		}
		if (!destination) {
			alert("請輸入出發地跟目的地!");
			return;
		}
		if (!traffic) {
			alert("請輸入交通工具!");
			return;
		}
		if (!people) {
			alert("請輸入人數!");
			return;
		}
		if (!money) {
			alert("請輸入價錢/人!");
			return;
		}
	};

	if (web3) {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				<Paper elevation={5} className="w-75 h-75 p-3 d-flex flex-column">
					<h1 className="text-center mb-3">{"發布揪團"}</h1>
					<Dropdown className="mb-3">
						<Dropdown.Toggle variant="success" className="w-100">
							{select_account || "選擇帳戶"}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							{accounts.map((item, i) => {
								return (
									<Dropdown.Item
										key={i}
										onClick={() => onChange("account", item)}
									>
										{item}
									</Dropdown.Item>
								);
							})}
						</Dropdown.Menu>
					</Dropdown>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"姓名"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入姓名"
							onChange={(e) => onChange("name", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"日期"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入日期"
							onChange={(e) => onChange("dates", e.target.value)}
							type="datetime-local"
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"出發地跟目的地"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入出發地跟目的地"
							onChange={(e) => onChange("destination", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"交通工具"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入交通工具"
							onChange={(e) => onChange("traffic", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"人數"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入人數"
							onChange={(e) => onChange("people", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"價錢/人"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入價錢/人"
							onChange={(e) => onChange("money", e.target.value)}
						/>
					</InputGroup>
				
					<Button
						variant="primary"
						size="lg"
						block
						onClick={onSubmit}
						disabled={!announce_contract}
					>
						{"確認送出"}
					</Button>
				</Paper>
			</div>
		);
	} else {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				{"loading..."}
			</div>
		);
	}
}

Announce.propTypes = {};
