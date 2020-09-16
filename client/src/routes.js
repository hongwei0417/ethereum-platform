import { Home } from "./views/Home";
import { Login } from "./views/Login";
import { HouseSearch } from "./views/HouseSearch";

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
		component: HouseSearch,
	},
];
