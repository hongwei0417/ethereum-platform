import { Home } from "./views/Home";
import { Login } from "./views/Login";

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
];
