import Web3 from "web3";
import moment from "moment";
import xlsx from "xlsx";
import AccountManager from "../client/src/contracts/AccountManager.json";
import Auth from "../client/src/contracts/Auth.json";
import CouponManager from "../client/src/contracts/CouponManager.json";
import Global from "../client/src/contracts/Global.json";
import Room from "../client/src/contracts/Room.json";
import RoomManager from "../client/src/contracts/RoomManager.json";
import RoomTransaction from "../client/src/contracts/RoomTransaction.json";
import Tool from "../client/src/contracts/Tool.json";
import TransactionManager from "../client/src/contracts/TransactionManager.json";
import User from "../client/src/contracts/User.json";
import UserAccount from "../client/src/contracts/UserAccount.json";
import UserManager from "../client/src/contracts/UserManager.json";
import eth_contract from "../client/src/eth_contract.json";
import { getContractInstance, contract_call, contract_send } from "./utils/getContract";
import { string_to_bytes32, bytes32_to_string } from "./utils/tools";
const createClient = require("ipfs-http-client");
const fs = require("fs");

const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
const web3 = new Web3(provider);
const ipfs = createClient("http://127.0.0.1:5001");
const newUser_path = `${__dirname}/result/newUser.json`;
const newRoom_path = `${__dirname}/result/newRoom.json`;
const booking_path = `${__dirname}/result/booking.json`;
const rating_path = `${__dirname}/result/rating.json`;
const user_num = 40;
const user_email = [
	"a@gmail.com",
	"ab@gmail.com",
	"abc@gmail.com",
	"abc1@gmail.com",
	"abc12@gmail.com",
	"abc123@gmail.com",
	"abcd@gmail.com",
	"abcd1@gmail.com",
	"abcd12@gmail.com",
	"abcd123@gmail.com",
	"abcd1234@gmail.com",
	"aaa1@gmail.com",
	"aaa12@gmail.com",
	"aaa123@gmail.com",
	"bbb1@gmail.com",
	"bbb12@gmail.com",
	"bbb123@gmail.com",
	"ccc1@gmail.com",
	"ccc12@gmail.com",
	"ccc123@gmail.com",
	"ddd123@gmail.com",
	"ddd1234@gmail.com",
	"ddd12345@gmail.com",
	"eee1@gmail.com",
	"eee12@gmail.com",
	"eee123@gmail.com",
	"eee1234@gmail.com",
	"eee12345@gmail.com",
	"abcde1@gmail.com",
	"abcde12@gmail.com",
	"abcde123@gmail.com",
	"abcde1234@gmail.com",
	"abcde12345@gmail.com",
	"abcdef1@gmail.com",
	"abcdef12@gmail.com",
	"abcdef123@gmail.com",
	"abcdef1234@gmail.com",
	"abcdef12345@gmail.com",
	"abcdefg1@gmail.com",
	"abcdefg12@gmail.com",
	"abcdefg123@gmail.com",
	"abcdefg1234@gmail.com",
	"abcdefg12345@gmail.com",
];
const newUser_result = [];
const newRoom_result = [];
const booking_result = [];
const rating_result = [];

async function newUser(accounts, index) {
	console.log(`用戶${index + 1} 開始執行...`);
	const start_time = moment();
	const Auth_C = await getContractInstance(web3, Auth, eth_contract.Auth);
	const UserManager_C = await getContractInstance(web3, UserManager, eth_contract.UserManager);

	try {
		//1. 取得信箱驗證碼
		const result1 = await contract_send(Auth_C, "verify", [user_email[index]], {
			from: accounts[0],
			gas: 6000000,
		});

		//2. 驗證信箱
		const result2 = await contract_call(
			Auth_C,
			"verify",
			[user_email[index], result1.events.verify_email.returnValues.token],
			{
				from: accounts[0],
				gas: 6000000,
			}
		);
		if (result2) {
			//3. 創建使用者
			const uid = string_to_bytes32(user_email[index]);
			const password = string_to_bytes32("1234");
			await contract_send(Auth_C, "create_user", [uid, password], {
				from: accounts[0],
				gas: 6000000,
			});

			//4. 登入
			const result4 = await contract_call(Auth_C, "login", [uid, password], {
				from: accounts[0],
				gas: 6000000,
			});
			if (result4) {
				//5. 首次登入產生區塊鏈金鑰
				const result5 = await contract_send(Auth_C, "generate_key", [uid], {
					from: accounts[0],
					gas: 6000000,
				});

				//6. 取得用戶智能合約位址
				const result6 = await contract_call(UserManager_C, "get_user", [uid], {
					from: accounts[0],
					gas: 6000000,
				});

				const end_time = moment();
				const diff = end_time.diff(start_time, "millisecond");
				newUser_result.push({
					index: `user-${index + 1}`,
					uid: uid,
					key: result5.events.show_BC_key.returnValues.key,
					user_addr: result6[0],
					diff: diff,
					start: start_time.toLocaleString(),
					end: end_time.toLocaleString(),
				});
			}
		}
	} catch (e) {
		console.log(e);
	}
}

async function newRoom(accounts, index) {
	console.log(`用戶${index + 1} 開始執行...`);
	const start_time = moment();
	const { uid, key, user_addr } = newUser_result[index];
	const Auth_C = await getContractInstance(web3, Auth, eth_contract.Auth);
	const RoomManager_C = await getContractInstance(web3, RoomManager, eth_contract.RoomManager);
	const User_C = await getContractInstance(web3, User, user_addr);

	try {
		//1. 成為民宿業者
		await contract_send(User_C, "set_role", [1], {
			from: accounts[0],
			gas: 6000000,
		});

		//2. 用戶身分驗證
		await contract_send(Auth_C, "authenticate", [1, uid, key, user_addr], {
			from: accounts[0],
			gas: 6000000,
		});

		//3. 創建房間
		await contract_send(User_C, "create_room", [uid, `House-${index + 1}`, 120.55, 23.8], {
			from: accounts[0],
			gas: 6000000,
		});

		//4. 取得房間實體
		const result4 = await contract_call(RoomManager_C, "get_user_all_rooms", [uid], {
			from: accounts[0],
			gas: 6000000,
		});
		if (result4[1].length > 0) {
			const Room_C = await getContractInstance(web3, Room, result4[1][0]);

			//5. 房間身分驗證
			await contract_send(Auth_C, "authenticate", [2, uid, key, result4[1][0]], {
				from: accounts[0],
				gas: 6000000,
			});

			//6. 修改房間內容
			await contract_send(
				Room_C,
				"set_room_info",
				[
					`House-${index + 1}`,
					"雙人套房",
					moment().unix(),
					moment().unix() + 86400 * 7,
					10,
				],
				{
					from: accounts[0],
					gas: 6000000,
				}
			);
			await contract_send(Room_C, "set_room_price", [false, 1500], {
				from: accounts[0],
				gas: 6000000,
			});

			const end_time = moment();
			const diff = end_time.diff(start_time, "millisecond");
			newRoom_result.push({
				index: `user-${index + 1}`,
				uid: uid,
				room_id: result4[0][0],
				room_addr: result4[1][0],
				diff: diff,
				start: start_time.toLocaleString(),
				end: end_time.toLocaleString(),
			});
		}
	} catch (error) {
		console.log(error);
	}
}

async function booking(accounts, T_index, H_index) {
	console.log(`用戶${T_index + 1} 與 用戶${H_index + 1} 開始進行交易...`);
	const start_time = moment();
	const Auth_C = await getContractInstance(web3, Auth, eth_contract.Auth);
	const TransactionManager_C = await getContractInstance(
		web3,
		TransactionManager,
		eth_contract.TransactionManager
	);
	const User_C = await getContractInstance(web3, User, newUser_result[T_index].user_addr);

	//1. 旅遊者身分驗證
	await contract_send(
		Auth_C,
		"authenticate",
		[
			1,
			newUser_result[T_index].uid,
			newUser_result[T_index].key,
			newUser_result[T_index].user_addr,
		],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);

	//2. 建立交易智能合約
	const contract = new web3.eth.Contract(RoomTransaction.abi);
	const { room_addr } = newRoom_result.find((i) => i.index === newUser_result[H_index].index);
	const result2 = await contract
		.deploy({
			data: RoomTransaction.bytecode,
			arguments: [
				newUser_result[T_index].user_addr,
				newUser_result[H_index].user_addr,
				room_addr,
				eth_contract.Global,
			],
		})
		.send({
			from: accounts[0],
			gas: 6000000,
			value: 1000000000000,
		});
	const txn_addr = result2.options.address;

	//3. 創建一筆交易
	await contract_send(
		User_C,
		"create_room_txn",
		[txn_addr, room_addr, newUser_result[T_index].uid, newUser_result[H_index].uid],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);

	//4. 建立IPFS數據
	const data = {
		traveler_addr: "0x2AE0E9da660194D8AC0a4C364d15e6F71847f5a8",
		hotelier_addr: "0x5223629122D7F618B17dDA49D6e66e3779B51923",
		room_addr: "0x3954b876bb9ef5DdD84E85B480B64DE30e39Fcfc",
		price: 1500,
		txn_time: 1615219119,
	};
	const { cid } = await ipfs.add(JSON.stringify(data));
	await contract_send(TransactionManager_C, "set_IPFS_hash", [txn_addr, cid.toString()], {
		from: accounts[0],
		gas: 6000000,
	});

	//5. 民宿業者身分驗證
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[H_index].uid, newUser_result[H_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);

	//6. 民宿業者接受訂單
	const RoomTransaction_C = await getContractInstance(web3, RoomTransaction, txn_addr);
	await contract_send(RoomTransaction_C, "accept", [], {
		from: accounts[0],
		gas: 6000000,
	});

	//7. 等待交易成功
	let status = false;
	while (!status) {
		let result7 = await contract_call(RoomTransaction_C, "get_txn_status", [], {
			from: accounts[0],
			gas: 6000000,
		});
		status = result7[0];
	}
	const end_time = moment();
	const diff = end_time.diff(start_time, "millisecond");
	booking_result.push({
		traveler_index: `user-${T_index + 1}`,
		hotelier_index: `user-${H_index + 1}`,
		traveler_uid: newUser_result[T_index].uid,
		hotelier_uid: newUser_result[H_index].uid,
		txn_addr: txn_addr,
		CID: cid.toString(),
		diff: diff,
		start: start_time.toLocaleString(),
		end: end_time.toLocaleString(),
	});
}

async function rating(accounts, T_index, H_index) {
	console.log(`用戶${T_index + 1} 與 用戶${H_index + 1} 開始進行交易...`);
	const start_time = moment();
	const score1 = 8,
		score2 = 5,
		score3 = 9;
	const Auth_C = await getContractInstance(web3, Auth, eth_contract.Auth);
	const { txn_addr } = booking_result.find(
		(i) =>
			i.traveler_index === newUser_result[T_index].index &&
			i.hotelier_index === newUser_result[H_index].index
	);
	const { room_addr } = newRoom_result.find((i) => i.index === newUser_result[H_index].index);
	const RoomTransaction_C = await getContractInstance(web3, RoomTransaction, txn_addr);
	const Room_C = await getContractInstance(web3, Room, room_addr);
	const Traveler_C = await getContractInstance(web3, User, newUser_result[T_index].user_addr);
	const Hotelier_C = await getContractInstance(web3, User, newUser_result[H_index].user_addr);

	//1. 入房、退房
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[T_index].uid, newUser_result[T_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	await contract_send(RoomTransaction_C, "room_check", [], {
		from: accounts[0],
		gas: 6000000,
	});
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[T_index].uid, newUser_result[T_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	await contract_send(RoomTransaction_C, "room_check", [], {
		from: accounts[0],
		gas: 6000000,
	});

	//2. 雙方確認訂單
	await contract_send(RoomTransaction_C, "check_txn", [newUser_result[T_index].user_addr], {
		from: accounts[0],
		gas: 6000000,
	});
	await contract_send(RoomTransaction_C, "check_txn", [newUser_result[H_index].user_addr], {
		from: accounts[0],
		gas: 6000000,
	});

	//3. 民宿業者完成訂單
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[H_index].uid, newUser_result[H_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	await contract_send(RoomTransaction_C, "complete_txn", [], {
		from: accounts[0],
		gas: 6000000,
	});

	//4. 旅遊者進行房間評價
	let rating_count = 0,
		rating_score = 0;
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[T_index].uid, newUser_result[T_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	rating_count = await contract_call(Room_C, "rating_count", [], {
		from: accounts[0],
		gas: 6000000,
	});
	rating_score = await contract_call(Room_C, "rating_score", [], {
		from: accounts[0],
		gas: 6000000,
	});
	const calculate_score1 = parseInt((rating_score * rating_count + score1) / (rating_count + 1));
	await contract_send(RoomTransaction_C, "rate_photo", [score1, calculate_score1], {
		from: accounts[0],
		gas: 6000000,
	});

	//5. 旅遊者交易評價
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[T_index].uid, newUser_result[T_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	rating_count = await contract_call(Hotelier_C, "rating_count", [], {
		from: accounts[0],
		gas: 6000000,
	});
	rating_score = await contract_call(Hotelier_C, "rating_score", [], {
		from: accounts[0],
		gas: 6000000,
	});
	const calculate_score2 = parseInt((rating_score * rating_count + score2) / (rating_count + 1));
	await contract_call(RoomTransaction_C, "rate_txn", [0, score2, calculate_score2], {
		from: accounts[0],
		gas: 6000000,
	});

	//6. 民宿業者交易評價
	await contract_send(
		Auth_C,
		"authenticate",
		[3, newUser_result[T_index].uid, newUser_result[T_index].key, txn_addr],
		{
			from: accounts[0],
			gas: 6000000,
		}
	);
	rating_count = await contract_call(Traveler_C, "rating_count", [], {
		from: accounts[0],
		gas: 6000000,
	});
	rating_score = await contract_call(Traveler_C, "rating_score", [], {
		from: accounts[0],
		gas: 6000000,
	});
	const calculate_score3 = parseInt((rating_score * rating_count + score3) / (rating_count + 1));
	await contract_call(RoomTransaction_C, "rate_txn", [0, score3, calculate_score3], {
		from: accounts[0],
		gas: 6000000,
	});

	const end_time = moment();
	const diff = end_time.diff(start_time, "millisecond");
	rating_result.push({
		traveler_index: `user-${T_index + 1}`,
		hotelier_index: `user-${H_index + 1}`,
		traveler_uid: newUser_result[T_index].uid,
		hotelier_uid: newUser_result[H_index].uid,
		txn_addr: txn_addr,
		photo_rating: [score1, calculate_score1],
		traveler_rating: [score2, calculate_score2],
		hotelier_rating: [score2, calculate_score3],
		diff: diff,
		start: start_time.toLocaleString(),
		end: end_time.toLocaleString(),
	});
}

async function main() {
	const accounts = await web3.eth.getAccounts();
	const promises1 = [];
	const promises2 = [];
	const promises3 = [];
	const promises4 = [];
	const workBook = {
		SheetNames: ["創建用戶", "創建房間", "雙方交易", "交易完成評價"],
		Sheets: {},
	};

	//1. 創建用戶程序
	console.log("-----------------------\r\n創建用戶程序開始!");
	for (let i = 0; i < user_num; i++) {
		promises1.push(newUser(accounts, i));
	}
	await Promise.all(promises1);
	fs.writeFile(newUser_path, JSON.stringify(newUser_result), function (err) {
		if (err) return console.log(err);
		console.log(`全部共${user_num}位使用者創建程序完成!`);
	});
	const jsonWorkSheet1 = xlsx.utils.json_to_sheet(newUser_result);
	workBook.Sheets["創建用戶"] = jsonWorkSheet1;

	//2. 創建房間程序
	console.log("-----------------------\r\n創建房間程序開始!");
	let n2 = 0;
	for (let i = 0; i < user_num; i++) {
		if (i % 2 === 1) {
			promises2.push(newRoom(accounts, i));
			n2++;
		}
	}
	await Promise.all(promises2);
	fs.writeFile(newRoom_path, JSON.stringify(newRoom_result), function (err) {
		if (err) return console.log(err);
		console.log(`全部共${n2}位民宿業者程序完成!`);
	});
	const jsonWorkSheet2 = xlsx.utils.json_to_sheet(newRoom_result);
	workBook.Sheets["創建房間"] = jsonWorkSheet2;

	//3. 雙方進行交易
	console.log("-----------------------\r\n雙方交易程序開始!");
	let n3 = 0;
	for (let i = 0; i < user_num; i += 2) {
		promises3.push(booking(accounts, i, i + 1));
		n3++;
	}
	await Promise.all(promises3);
	fs.writeFile(booking_path, JSON.stringify(booking_result), function (err) {
		if (err) return console.log(err);
		console.log(`全部共${n3}對交易完成!`);
	});
	const jsonWorkSheet3 = xlsx.utils.json_to_sheet(booking_result);
	workBook.Sheets["雙方交易"] = jsonWorkSheet3;

	//4. 雙方評價
	console.log("-----------------------\r\n評價程序開始!");
	let n4 = 0;
	for (let i = 0; i < user_num; i += 2) {
		promises4.push(rating(accounts, i, i + 1, n4));
		n4++;
	}
	await Promise.all(promises4);
	fs.writeFile(rating_path, JSON.stringify(rating_result), function (err) {
		if (err) return console.log(err);
		console.log(`全部共${n4}對互評完成!`);
	});
	const jsonWorkSheet4 = xlsx.utils.json_to_sheet(rating_result);
	workBook.Sheets["交易完成評價"] = jsonWorkSheet4;

	//寫入csv
	xlsx.writeFile(workBook, `./${user_num}人測試結果.xlsx`);
}

main();
