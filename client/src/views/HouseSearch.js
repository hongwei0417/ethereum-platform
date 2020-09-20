import React from "react";
import SearchBar from "../components/SearchBar";
import HouseCard from "../components/HouseCard";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import { get_user_all_lease_info } from "../utils/lease";
import LeaseManager from "../contracts/LeaseManager.json";
import UserManager from "../contracts/UserManager.json";
import eth_addr from "../eth_contract.json";
import NoContent from "../components/NoContent";
import TravelTab from "../components/TravelTab";

export function HouseSearch() {
	const [web3, set_web3] = React.useState(null);
	const [LM, set_LM] = React.useState(null);
	const [UM, set_UM] = React.useState(null);
	const [user_list, set_user_list] = React.useState([]);
	const [house_list, set_house_list] = React.useState([]);
	const [user, set_user] = React.useState(null);

	//載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			set_web3(web3);
		};
		load();
	}, []);

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let instance1 = await getContractInstance(web3, UserManager, eth_addr.UserManager);
				let instance2 = await getContractInstance(
					web3,
					LeaseManager,
					eth_addr.LeaseManager
				);
				set_UM(instance1);
				set_LM(instance2);
			}
		};
		load();
	}, [web3]);

	//載入所有用戶
	React.useEffect(() => {
		const load = async () => {
			if (UM) {
				let list = await UM.methods.get_user_list().call();
				set_user_list(list[0]);
				console.log(list);
			}
		};
		load();
	}, [UM]);

	//載入User
	React.useEffect(() => {
		let user_str = localStorage.getItem("user");
		if (user_str) {
			let user = JSON.parse(user_str);
			set_user(user);
		}
	}, [web3]);

	//載入所有房間
	React.useEffect(() => {
		const load = async () => {
			if (user_list.length > 0 && LM) {
				let result = [];
				for (let i = 0; i < user_list.length; i++) {
					let lease_infos = await get_user_all_lease_info(web3, user_list[i], LM);
					result = result.concat(lease_infos);
				}
				set_house_list(result);
			}
		};
		load();
	}, [user_list]);

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TravelTab currentPage={1} />
				</div>
				<h3 className="text-white-50 mb-3">房間列表瀏覽</h3>
				<div className="w-50">
					<SearchBar />
					<hr color="white" />
					{house_list.map((item, i) => {
						return (
							<HouseCard
								key={i}
								owner={item.owner}
								house_name={item.house_name}
								category={item.category}
								rented_out={item.rented_out}
								start_time={item.start_time}
								end_time={item.end_time}
								price={item.price}
								quantity={item.quantity}
							/>
						);
					})}
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
