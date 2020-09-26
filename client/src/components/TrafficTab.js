import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";

function TravelTab({ currentPage }) {
	const history = useHistory();

	//跳轉頁面
	const goToPage = (page) => {
		switch (page) {
			case 1:
				history.push("/Announce");
				break;
			case 2:
				history.push("/TrafficPublish");
				break;
			// case 3:
			// 	history.push("/txnList");
			// 	break;
			default:
		}
	};

	return (
		<React.Fragment>
			<div className="d-flex justify-content-around w-100">
				<Button
					variant={currentPage === 1 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(1)}
				>
					發布揪團
				</Button>
				<Button
					variant={currentPage === 2 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(2)}
				>
					發布揪團列表
				</Button>
				{/* <Button
					variant={currentPage === 3 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(3)}
				>
					交易資訊
				</Button> */}
			</div>
			<hr className="border-warning w-100" />
		</React.Fragment>
	);
}

TravelTab.propTypes = {};

export default TravelTab;
