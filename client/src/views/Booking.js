import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { connect_to_web3 } from "../utils/getWeb3";
import eth_addr from "../eth_contract.json";
import User from "../contracts/User.json";

export function Booking(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [user, set_user] = React.useState(null);
	const location = useLocation();
	const { id } = useParams();

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

	return <div></div>;
}
