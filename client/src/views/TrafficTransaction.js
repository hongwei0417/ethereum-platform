import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, Form, Button, Dropdown, DropdownButton,ListGroup ,Modal} from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_send ,contract_call } from "../utils/getContract";
import Announce from "../contracts/Announce.json";
import eth_addr from '../eth_contract.json';
import AnnounceManager from "../contracts/AnnounceManager.json";
import NoContent from "../components/NoContent";
import TrafficTab from "../components/TrafficTab";
import { get_all_user_info, get_user_all_announce_info,get_user_all_announce_info_paymoney } from "../utils/trafficall";
import { bytes32_to_string, string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import moment from "moment";
import User from "../contracts/User.json";
import TrafficCard from "../components/TrafficCard";

export function TrafficTransaction(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [An, set_An] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [user_info, set_user_info] = React.useState(null);
	const [announce_list, set_announce_list] = React.useState([]);

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
				let instance1 = await getContractInstance(web3, AnnounceManager, eth_addr.AnnounceManager);
				let instance2 = await getContractInstance(web3, User, user.address);
				set_An(instance1);
				console.log(instance1);
				set_user_info(instance2);
			}
		};
		load();
	}, [web3, user]);

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TrafficTab currentPage={5} />
				</div>
				<div className="mb-3">
					<TrafficList accounts={accounts} web3={web3} An={An} user={user} user_info={user_info} />
				</div>
			</div>
		);
	} else {
		if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

const TrafficList = ({ accounts, web3, An, user}) => {
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [traffic_list, set_traffic_list] = React.useState([]);
	const [traffic_contract, set_traffic_contract] = React.useState(null);
	const [traffic_contract1, set_traffic_contract1] = React.useState(null);

	//載入所有使用者相關跟單
	React.useEffect(() => {
		load_user_all_announce_list()
	}, [An])

	//取得使用者相關跟單
	const load_user_all_announce_list = async() => {
		if(An) {
			let all_announce_list = await get_user_all_announce_info_paymoney(An); 
			let user_announce_list = await get_all_user_info(web3, all_announce_list, user)
			//const data = await get_user_all_announce_info_paymoney(An, user.address);
			set_traffic_list(user_announce_list);
			console.log(user_announce_list);
		}
	}

	//開啟視窗
	const open_modal = async (item) => {
		//取得房屋合約實體
		let instance2 = await getContractInstance(web3, Announce, item.traffic_addr);
		set_traffic_contract1(instance2);
		set_current_data(item);
		set_open(true);
	};

	//關閉視窗
	const close_modal = () => {
		set_open(false);
		load_user_all_announce_list();
	};

	return (
		<React.Fragment>
			<h3 className="text-white-50">所有揪團列表</h3>;
				<ListGroup className="col-15">
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
								{`編號 :  ${item.traffic_id}  發布者姓名 : 【${item.name}】` }
							</ListGroup.Item>
							// <TrafficCard
							// 			key={i}
							// 			{...item}
							// 			onSubmit={() => open_modal(item)}
							// 		/>
						);
					})}
				</ListGroup>
			<Modal show={open} onHide={close_modal} centered>
				{/* <Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>{`${current_data.traffic_addr} 【${current_data.traffic_id}】`}</Modal.Title>
				</Modal.Header> */}
				<Modal.Body>
					<UpdateHouse
						user={user}
						An={An}
						accounts={accounts}
						traffic_data={current_data}
						close_modal={close_modal}
					/>
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</React.Fragment>
	);
};

const UpdateHouse = ({ accounts, traffic_data, close_modal,web3, An, user }) => {
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
			default:
				set_form_data({
					...form_data,
					[key]: value,
				});
		}
	};

	const onSubmit = async () => {

		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}
		if(traffic_data.paymoney === '0')
		{
			alert("跟單者還沒付錢");
		}
		// let result1 = await contract_send(
		// 	An,
		// 	"pay_announce",
		// 	[
		// 		string_to_bytes32(traffic_data.traffic_id)
		// 	],
		// 	{
		// 		from: select_account,
		// 		gas: 6000000,
		// 	}
		// 	);	
		// 	console.log(result1);
		alert("結單");
		//history.push("/TrafficConfirmList");
		
		close_modal();
	};

	console.log(form_data)

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
					<Form.Label type="datetime-local">日期 : {`${convert_dateTime_str(form_data.dates)}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>交通工具 : {`${form_data.traffic}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>人數 : {`${form_data.people}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>應付金額 : {`${form_data.money}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>出發地 : {`${form_data.destination_lon}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>目的地 : {`${form_data.destination_lat}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>跟單者已付金額 : {`${form_data.paymoney}`}</Form.Label>
				</Form.Group>
				<Button variant="primary" onClick={onSubmit} block>
				完成並結束訂單-確認收款
				</Button>
			
			</Form>
		</React.Fragment>
	);
};
