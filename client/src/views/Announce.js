import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, FormControl, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import Announce_Contract from "../contracts/Announce.json";
import eth_addr from '../eth_contract.json';
import NoContent from "../components/NoContent";
import { string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import TrafficTab from "../components/TrafficTab";

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
	const [payload, set_payload] = React.useState(null);
	const [user, set_user] = React.useState(null);

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
				console.log(contract)
				set_announce_contract(contract);
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
		try {
			let _bytes_name = web3.utils.utf8ToHex(name);
			let bytes_name = web3.utils.padRight(_bytes_name, 64);
			let _bytes_dates = web3.utils.utf8ToHex(dates);
			let bytes_dates = web3.utils.padRight(_bytes_dates, 64);
			let _bytes_destination = web3.utils.utf8ToHex(destination);
			let bytes_destination = web3.utils.padRight(_bytes_destination, 64);
			let _bytes_traffic = web3.utils.utf8ToHex(traffic);
			let bytes_traffic = web3.utils.padRight(_bytes_traffic, 64);
		    let _bytes_people = web3.utils.utf8ToHex(people);
			let bytes_people = web3.utils.padRight(_bytes_people, 64);
			let _bytes_money = web3.utils.utf8ToHex(money);
			let bytes_money = web3.utils.padRight(_bytes_money, 64);
			
			// * 執行智能合約
			// let result = await announce_contract.methods.verify(bytes_name,bytes_dates,bytes_destination,bytes_traffic,bytes_people,bytes_money).call({
			// 	from: select_account,
			// 	gas: 6000000,
			// });

			// get network ID and the deployed address
			const deployedAddress = eth_addr.Announce

			// create the instance
			const instance = new web3.eth.Contract(Announce_Contract.abi, deployedAddress);
			let result = await instance.methods
			.create_user(
				string_to_bytes32(generate_id(10)), 
				bytes_name,
				bytes_dates,
				bytes_destination,
				bytes_traffic,
				bytes_people,
				bytes_money
			)
			.send({
				from: select_account,
				gas: 6000000,
			});

			set_payload(JSON.stringify(result));

			alert("發布成功");
			console.log(result);

		} catch (error) {
			alert("發生錯誤");
			console.log(error);
		}
	};
	
	if (web3 && user) {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				<div className="w-50">
					<TrafficTab currentPage={2} />
				</div>
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
					<p className="text-center overflow-auto">{payload || "無資料"}</p>
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
		if(!user){
            return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

Announce.propTypes = {};
