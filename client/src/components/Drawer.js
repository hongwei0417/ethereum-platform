import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AirplanemodeActiveRoundedIcon from "@material-ui/icons/AirplanemodeActiveRounded";
import DriveEtaRoundedIcon from "@material-ui/icons/DriveEtaRounded";

const useStyles = makeStyles({
	list: {
		width: 250,
	},
	fullList: {
		width: "auto",
	},
});

export default function CustomDrawer({ open, toggle_drawer }) {
	const classes = useStyles();
	const [state, setState] = React.useState(false);

	React.useEffect(() => {
		setState(open);
	}, [open]);

	const list = (anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === "top" || anchor === "bottom",
			})}
			role="presentation"
			onClick={toggle_drawer}
			onKeyDown={toggle_drawer}
		>
			<List>
				<ListItem button key={0}>
					<ListItemIcon>
						<AirplanemodeActiveRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={"旅遊區塊鏈平台"} />
				</ListItem>
			</List>
			<List>
				<ListItem button key={1}>
					<ListItemIcon>
						<DriveEtaRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={"共乘區塊鏈平台"} />
				</ListItem>
			</List>
			<Divider />
		</div>
	);

	return (
		<Drawer anchor={"left"} open={state} onClose={toggle_drawer}>
			{list("left")}
		</Drawer>
	);
}
