import React from "react";
import AppBar from "./components/AppBar";
import CustomDrawer from "./components/Drawer";
import { Route, Switch } from "react-router-dom";
import { routes } from "./routes";

function App() {
	const [open, set_open] = React.useState(false);

	const toggle_drawer = () => {
		set_open(!open);
	};

	return (
		<React.Fragment>
			<AppBar toggle_drawer={toggle_drawer} />
			<Switch>
				{routes.map((item, i) => {
					return (
						<Route
							exact={i === 0}
							key={i}
							path={item.path}
							component={item.component}
						/>
					);
				})}
			</Switch>
			<CustomDrawer open={open} toggle_drawer={toggle_drawer} />
		</React.Fragment>
	);
}

export default App;
