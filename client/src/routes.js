import { Home } from "./views/Home";
import { Login } from "./views/Login";
import { HouseList } from "./views/HouseList";
import { MyHouse } from "./views/MyHouse";
import { TransactionList } from "./views/TransactionList";
import { Booking } from "./views/Booking";

export const routes = [
	{
		path: "/",
		name: "首頁",
		component: Home,
	},
	{
		path: "/home",
		name: "首頁",
		component: Home,
	},
	{
		path: "/login",
		name: "登入",
		component: Login,
	},
	{
		path: "/houseSearch",
		name: "房間列表",
		component: HouseList,
	},
	{
		path: "/myHouse",
		name: "我的房間",
		component: MyHouse,
	},
	{
		path: "/txnList",
		name: "我的交易",
		component: TransactionList,
	},
	{
		path: "/booking/:id",
		name: "我要訂房",
		component: Booking,
	},
];
