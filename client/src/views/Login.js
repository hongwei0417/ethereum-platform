import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, FormControl, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import Auth_Contract from "../contracts/Auth.json";

export function Login({}) {
	const [name, set_name] = React.useState("");
	const [password, set_password] = React.useState("");
	const [select_account, set_select_account] = React.useState(null);
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [auth_contract, set_auth_contract] = React.useState(null);
	const [payload, set_payload] = React.useState(null);

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
				let contract = await getContractInstance(web3, Auth_Contract);
				set_auth_contract(contract);
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
			case "password":
				set_password(value);
				break;
			default:
				break;
		}
	};

	//檢查是否有這個帳戶
	const check_user = async () => {
		try {
			// * 執行智能合約
			let result = await auth_contract.methods.get_user(select_account).call({
				from: select_account,
				gas: 6000000,
			});
			console.log(result);
			return result;
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	//註冊
	const register = async () => {
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
		if (!password) {
			alert("請輸入密碼!");
			return;
		}
		if (!name) {
			alert("請輸入用戶名稱!");
			return;
		}
		try {
			//轉型(因智能合約參數使用bytes32)
			let _bytes_name = web3.utils.utf8ToHex(name);
			let bytes_name = web3.utils.padRight(_bytes_name, 64);
			let _bytes_password = web3.utils.utf8ToHex(password);
			let bytes_password = web3.utils.padRight(_bytes_password, 64);

			// * 執行智能合約
			let result = await auth_contract.methods
				.create_user(
					select_account, //用第一個帳戶
					bytes_name,
					bytes_password
				)
				.send({
					from: select_account,
					gas: 6000000,
				});

			set_payload(JSON.stringify(result));

			alert("註冊成功");
			console.log(result);
		} catch (error) {
			alert("註冊失敗");
			console.log(error);
		}
	};

	//登入
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
		if (!password) {
			alert("請輸入密碼!");
			return;
		}

		//查看用戶使否存在
		const user = await check_user();

		if (user) {
			try {
				let _bytes_password = web3.utils.utf8ToHex(password);
				let bytes_password = web3.utils.padRight(_bytes_password, 64);
				// * 執行智能合約
				let result = await auth_contract.methods.verify(bytes_password).call({
					from: select_account,
					gas: 6000000,
				});

				if (result) {
					alert("登入成功");
				} else {
					alert("登入失敗");
				}
			} catch (error) {
				alert("發生錯誤");
				console.log(error);
			}
		} else {
			alert("用戶不存在");
		}
	};

	if (web3) {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				<Paper elevation={5} className="w-75 h-75 p-3 d-flex flex-column">
					<h1 className="text-center mb-3">{"登入"}</h1>
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
							<InputGroup.Text>{"用戶名稱"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入用戶名稱"
							onChange={(e) => onChange("name", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"密碼"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入密碼"
							onChange={(e) => onChange("password", e.target.value)}
						/>
					</InputGroup>
					<p className="text-center overflow-auto">{payload || "無資料"}</p>
					<Button
						variant="warning"
						size="lg"
						block
						className="mt-auto"
						onClick={register}
						disabled={!auth_contract}
					>
						{"註冊"}
					</Button>
					<Button
						variant="primary"
						size="lg"
						block
						onClick={onSubmit}
						disabled={!auth_contract}
					>
						{"登入"}
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

Login.propTypes = {};
