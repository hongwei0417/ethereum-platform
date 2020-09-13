import { Home } from "./views/Home";
import { Login } from "./views/Login";
import { Announce } from "./views/Announce";

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
		path: "/Announce",
		name: "發布",
		component: Announce,
	},
];
