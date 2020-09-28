import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, Form, Button, Dropdown, DropdownButton,ListGroup ,Modal} from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_send  } from "../utils/getContract";
import Ownable from "../contracts/Ownable.json";
import eth_addr from '../eth_contract.json';
import Announce from "../contracts/Announce.json";
import TrafficManager from "../contracts/TrafficManager.json";
import NoContent from "../components/NoContent";
import TrafficTab from "../components/TrafficTab";
import { get_all_ownable, get_all_ownable_info} from "../utils/trafficall";
import { string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import moment from "moment";

export function TrafficPublish(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [An, set_An] = React.useState(null);
	const [user, set_user] = React.useState(null);
	//const [page, set_page] = React.useState(1);
	const [ownable_contract, set_ownable_contract] = React.useState(null);

	//載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			set_web3(web3);
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
				let instance1 = await getContractInstance(web3, Announce, eth_addr.Announce);
				// let instance2 = await getContractInstance(
				// 	web3,
				// 	Announce,
				// 	eth_addr.Announce
				// );
				set_An(instance1);
				console.log(instance1);
				// set_Announce(instance2);
			}
		};
		load();
	}, [web3, user]);
	

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TrafficTab currentPage={2} />
				</div>
				<div className="mb-3">
					{/* <Button
						className="mr-3"
						variant={page === 1 ? "light" : "outline-light"}
						onClick={(e) => set_page(1)}
					>
						我的房間
					</Button> */}
					{/* <Button
						className="mr-3"
						variant={page === 2 ? "light" : "outline-light"}
						onClick={(e) => set_page(2)}
					>
						新增房間
					</Button> */}
					<TrafficList accounts={accounts} web3={web3} An={An}  user={user} />
				</div>
				
				{/* {page === 1 && <HouseList accounts={accounts} web3={web3} user={user} />} */}
				{/* {page === 2 && <AddHouse accounts={accounts} user_contract={user_contract} />} */}
			</div>
		);
	} else {
		if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

const TrafficList = ({ accounts, web3, An}) => {
	const [current_data, set_current_data] = React.useState({});
	const [current_data1, set_current_data1] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [traffic_list, set_traffic_list] = React.useState([]);
	const [traffic_list1, set_traffic_list1] = React.useState([]);
	const [traffic_contract, set_traffic_contract] = React.useState(null);

	//初始載入
	React.useEffect(() => {
		load_user_traffic();
	}, [An,web3]);

	//取得使用者所有揪團列表
	const load_user_traffic = async () => {
		if (web3&& An) {

			let list = await get_all_ownable(An);
			let list1 = await get_all_ownable_info(An);

			set_traffic_list(list1);
			console.log(list,list1);
		}
	};

	//開啟視窗
	const open_modal = async (item) => {
		//取得房屋合約實體
		let instance1 = await getContractInstance(web3, Announce, item.traffic_addr);
		set_traffic_contract(instance1);
		// let instance = await get_all_user(An, item.lease_addr);
		// set_traffic_contract(instance);
		set_current_data(item);
		// set_current_data1(item);
		set_open(true);
	};

	//關閉視窗
	const close_modal = () => {
		set_open(false);
		load_user_traffic();
	};

	return (
		<React.Fragment>
			<h3 className="text-white-50">所有揪團列表</h3>;
			<Paper elevation={5} className="w-100">
				<ListGroup>
					{traffic_list.map((item, i) => {
						return (
							<ListGroup.Item
								key={i}
								action
								variant="success"
								style={{
									whiteSpace: "normal",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
								onClick={(e) => open_modal(item)}
							>
								{`${item.traffic_addr} 【${item.traffic_id}】`}
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</Paper>
			<Modal show={open} onHide={close_modal} centered>
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>{`${current_data.traffic_addr} 【${current_data.traffic_id}】`}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<UpdateHouse
						accounts={accounts}
						traffic_data={current_data}
						traffic_contract={traffic_contract}
						close_modal={close_modal}
					/>
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</React.Fragment>
	);
};

const UpdateHouse = ({ accounts, traffic_data, traffic_contract, close_modal }) => {
	const [form_data, set_form_data] = React.useState({});
	const [select_account, set_select_account] = React.useState(null);

	//載入表單資料
	React.useEffect(() => {
		set_form_data({
			...traffic_data,
			 dates: convert_dateTime_str(traffic_data.dates),
		});
	}, [traffic_data]);
	console.log(traffic_data);

	const onChange = (key, value) => {
		switch (key) {
			case "account":
				set_select_account(value);
				break;
			case "name":
				set_form_data(value)({
					...form_data,
					name: value,
				});
				break;
			case "dates":
				set_form_data(value)({
					...form_data,
					dates: value,
				});
				break;
			case "destination":
				set_form_data(value)({
					...form_data,
					destination: value,
				});
				break;
			case "traffic":
				set_form_data(value)({
					...form_data,
					traffic: value,
				});
				break;
			case "people":
				set_form_data(value)({
					...form_data,
					people: value,
				});
				break;
			case "money":
				set_form_data(value)({
					...form_data,
					money: value,
				});
				break;
			default:
				break;
		}
	};

	const onSubmit = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		close_modal();
	};

	return (
		<React.Fragment>
			<Dropdown className="mb-3">
				<Dropdown.Toggle variant="success" className="w-100">
					{select_account || "選擇帳戶"}
				</Dropdown.Toggle>
				<Dropdown.Menu className="w-100">
					{accounts.map((item, i) => {
						return (
							<Dropdown.Item
								className="text-center"
								key={i}
								onClick={(e) => onChange("account", item)}
							>
								{item}
							</Dropdown.Item>
						);
					})}
				</Dropdown.Menu>
			</Dropdown>
			<hr />
			<Form>
				<Form.Group>
					<Form.Label>姓名 : {`${form_data.name}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>日期 : {`${form_data.dates}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>出發地跟目的地 : {`${form_data.destination}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>交通工具 : {`${form_data.traffic}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>人數 : {`${form_data.people}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>價錢/人 : {`${form_data.money}`}</Form.Label>
				</Form.Group>
			
				<Button variant="primary" onClick={onSubmit} block>
					確定跟團
				</Button>
			</Form>
		</React.Fragment>
	);
};
