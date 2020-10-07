import React from "react";
import { Map, Marker, Popup, TileLayer, Polygon, Rectangle } from "react-leaflet";
import { Modal, Form, Button, Dropdown } from "react-bootstrap";
import { generate_id, string_to_bytes32 } from "../utils/tools";
import { contract_send } from "../utils/getContract";
import "../index.scss";

export default function HouseMap({ house_list, user_contract, accounts = [], refresh, canAdd }) {
	const [select_account, set_select_account] = React.useState(null);
	const [show_addModal, set_show_addModal] = React.useState(false);
	const [form_data, set_form_data] = React.useState({});
	const position = [24.1, 120.675678]; //台中

	//房子座標點
	const HouseMarker = React.memo((props) => {
		console.log(props);

		return (
			<Marker position={[props.lat, props.lon]}>
				<Popup className="map-popup">
					<div className="title">{props.house_name}</div>
					<div className="subtitle">{`房間種類：${props.category || "無"}`}</div>
					<div className="subtitle">{`價格：${props.price || 0}`}</div>
					<div className="subtitle">{`數量：${props.quantity || 0}`}</div>
				</Popup>
			</Marker>
		);
	}, []);

	//更改輸入內容
	const onChange = (type, value) => {
		return (e) => {
			switch (type) {
				case "account":
					set_select_account(value);
					break;
				default:
					set_form_data({ ...form_data, [type]: e.target.value });
					break;
			}
		};
	};

	//開啟彈出視窗
	const open_modal = (type) => {
		return (e) => {
			if (canAdd) {
				switch (type) {
					case "add_house":
						console.log(e);
						set_form_data({
							lat: e.latlng.lat,
							lon: e.latlng.lng,
						});
						set_show_addModal(true);
						break;
					default:
						break;
				}
			} else {
				console.log(e);
			}
		};
	};

	//關閉彈出視窗
	const close_modal = () => {
		set_show_addModal(false);
	};

	//確認送出
	const submit = (type) => {
		return async (e) => {
			if (!select_account) {
				alert("請先選擇帳戶");
				return;
			}
			if (!form_data.house_name) {
				alert("請先輸入房間名稱");
				return;
			}
			switch (type) {
				case "add_house":
					let result = await contract_send(
						user_contract,
						"create_lease",
						[
							form_data.house_name,
							form_data.lon.toString(),
							form_data.lat.toString(),
							string_to_bytes32(generate_id(10)), //lid
						],
						{
							from: select_account,
							gas: 6000000,
						}
					);
					console.log(result);
					alert("新增成功");
					refresh();
					close_modal();
					break;

				default:
					break;
			}
		};
	};

	return (
		<React.Fragment>
			<Map
				center={position}
				zoom={10.5}
				style={{ height: "100%" }}
				onClick={open_modal("add_house")}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				/>
				{house_list.map((item, i) => {
					return <HouseMarker key={i} {...item} />;
				})}
			</Map>
			<Modal show={show_addModal} onHide={close_modal} centered>
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						確認此地房間位置資訊
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Dropdown className="mb-3">
						<Dropdown.Toggle variant="success" className="w-100">
							{select_account || "選擇帳戶"}
						</Dropdown.Toggle>
						<Dropdown.Menu className="w-100">
							{accounts.map((item, i) => {
								return (
									<Dropdown.Item
										className="text-center"
										key={i}
										onClick={onChange("account", item)}
									>
										{item}
									</Dropdown.Item>
								);
							})}
						</Dropdown.Menu>
					</Dropdown>
					<Form>
						<Form.Group>
							<Form.Label>房間名稱</Form.Label>
							<Form.Control
								type="text"
								value={form_data.house_name || ""}
								placeholder="請輸入房間名稱"
								onChange={onChange("house_name")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>房間緯度</Form.Label>
							<Form.Control
								type="text"
								value={form_data.lat || ""}
								placeholder="請輸入緯度"
								onChange={onChange("lat")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>房間經度</Form.Label>
							<Form.Control
								type="text"
								value={form_data.lon || ""}
								placeholder="請輸入經度"
								onChange={onChange("lon")}
							/>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="warning" onClick={submit("add_house")} block>
						新增房間
					</Button>
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	);
}
