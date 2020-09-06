import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}));

export default function CustomAppBar({ toggle_drawer }) {
	const classes = useStyles();
	const history = useHistory();

	const toggle_login = () => {
		history.push("/login");
	};

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						edge="start"
						className={classes.menuButton}
						color="inherit"
						aria-label="menu"
						onClick={toggle_drawer}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" className={classes.title}>
						{"區塊鏈整合平台"}
					</Typography>
					<Button color="inherit" onClick={toggle_login}>
						{"登入"}
					</Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}
