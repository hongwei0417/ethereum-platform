import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { ListGroup } from "react-bootstrap";
import moment from "moment";

function HouseCard({
	owner,
	house_name,
	category,
	rented_out,
	start_time,
	end_time,
	price,
	quantity,
}) {
	return (
		<Card variant="outlined" className="mb-3">
			<CardHeader
				avatar={<Avatar>{house_name ? house_name[0] : "無"}</Avatar>}
				action={
					<IconButton>
						<MoreVertIcon />
					</IconButton>
				}
				title={house_name || "---"}
				subheader={owner || "---"}
			/>
			<CardContent>
				<ListGroup variant="flush">
					<ListGroup.Item>{`出租狀態： ${
						rented_out ? "已出租" : "未出租"
					}`}</ListGroup.Item>
					<ListGroup.Item>{`開始時間： ${
						moment(start_time).toLocaleString() || "---"
					}`}</ListGroup.Item>
					<ListGroup.Item>{`結束時間： ${
						moment(end_time).toLocaleString() || "---"
					}`}</ListGroup.Item>
					<ListGroup.Item>{`價格： ${price || "---"}`}</ListGroup.Item>
					<ListGroup.Item>{`數量： ${quantity || "---"}`}</ListGroup.Item>
					<ListGroup.Item>{`種類： ${category || "---"}`}</ListGroup.Item>
				</ListGroup>
			</CardContent>
		</Card>
	);
}
export default HouseCard;
