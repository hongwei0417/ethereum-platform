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
import { get_all_announce_info, get_all_user_info,get_all_user_confirm_info} from "../utils/trafficall";
import { bytes32_to_string, string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import moment from "moment";
import User from "../contracts/User.json";

export function TrafficConfirmList(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [An, set_An] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [user_info, set_user_info] = React.useState(null);

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
					<TrafficTab currentPage={4} />
				</div>
				<div className="mb-3">
					<TrafficList accounts={accounts} web3={web3} An={An} user={user}  user_info={user_info}/>
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

const TrafficList = ({ accounts, web3, An,user,Tr}) => {
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [traffic_list, set_traffic_list] = React.useState([]);
	const [traffic_contract, set_traffic_contract] = React.useState(null);
	const [traffic_contract1, set_traffic_contract1] = React.useState(null);
	//初始載入
	React.useEffect(() => {
		load_user_traffic();
	}, [An,web3]);

	//取得使用者所有揪團列表
	const load_user_traffic = async () => {
		if (web3&& An) {
			// //更新資訊
			let list = await get_all_announce_info(An);
			set_traffic_list(list);
			console.log(list);
			//console.log(user_announce_list);
		}
	};

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
		load_user_traffic();
	};

	return (
		<React.Fragment>
			<h3 className="text-white-50">提供揪團列表</h3>;
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
								{`${item.u}`}
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</Paper>
		</React.Fragment>
	);
};

