import React from "react";
import { Map, Marker, Popup, TileLayer, Polygon, Rectangle } from "react-leaflet";
import { Modal, Form, Button, Dropdown } from "react-bootstrap";
import { generate_id, string_to_bytes32 } from "../utils/tools";
import { contract_send } from "../utils/getContract";
import { get_data_from_coordinate } from "../utils/api";

//房子座標點
const HouseMarker = (props) => {
	const markerRef = React.useRef();

	React.useEffect(() => {
		if (props.showPopup) {
			markerRef.current.leafletElement.openPopup();
		}
	}, [props.showPopup]);

	return (
		<Marker ref={markerRef} position={[props.lat, props.lon]}>
			<Popup className="map-popup">
				<div className="title">{props.name}</div>
			</Popup>
		</Marker>
	);
};

export default function TrafficMap({
	house_list,
	user_contract,
	accounts = [],
	refresh,
	canAdd,
	selectedIndex,
	search_data,
}) {
	const [select_account, set_select_account] = React.useState(null);
	const [show_addModal, set_show_addModal] = React.useState(false);
	const [form_data, set_form_data] = React.useState({});
	const [zoom, set_zoom] = React.useState(10.5);
	const [search_address, set_search_address] = React.useState("中興大學");
	const [search_position, set_search_position] = React.useState([24.123206, 120.675679]); 

	//顯示搜尋定位座標點
	const SearchMarker = ({ position, address }) => {
		return (
			<Marker position={position}>
				<Popup>
					<div className="d-flex flex-column align-items-center justify-content-center">
						<div>{address}</div>
						{canAdd && (
							<Button
								className="mt-2"
								variant="warning"
								size="sm"
								style={{ fontSize: "0.8rem" }}
								onClick={open_modal("add_search_house", { position, address })}
							>
								新增房間
							</Button>
						)}
					</div>
				</Popup>
			</Marker>
		);
	};

	//變更目前位置
	React.useEffect(() => {
		if (search_data) {
			const { address, location } = search_data;
			set_zoom(18);
			set_search_address(address);
			set_search_position(location);
		}
	}, [search_data]);

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
	const open_modal = (type, value) => {
		return async (e) => {
			if (canAdd) {
				switch (type) {
					case "add_house":
						const data = await get_data_from_coordinate({
							lat: e.latlng.lat,
							lon: e.latlng.lng,
						});
						set_form_data({
							lat: e.latlng.lat,
							lon: e.latlng.lng,
							address: data.address,
						});
						set_show_addModal(true);
						console.log(e);
						break;
					case "add_search_house":
						set_form_data({
							lat: value.position[0],
							lon: value.position[1],
							address: value.address,
						});
						set_show_addModal(true);
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
				alert("請選擇帳戶!");
				return;
			}
			if (!form_data.name) {
				alert("請輸入姓名!");
				return;
			}
			if (!form_data.dates) {
				alert("請輸入日期!");
				return;
			}
			if (!form_data.destination_lon) {
				alert("請輸入出發地!");
				return;
			}
			if (!form_data.destination_lat) {
				alert("請輸入目的地!");
				return;
			}
			if (!form_data.traffic) {
				alert("請輸入交通工具!");
				return;
			}
			if (!form_data.people) {
				alert("請輸入人數!");
				return;
			}
			if (!form_data.money) {
				alert("請輸入價錢/人!");
				return;
			}
			try {
				let result = await contract_send(
					user_contract,
					"create_announce",
					[
						form_data.name,
						form_data.dates,
						form_data.destination_lon,
						form_data.destination_lat,
						form_data.traffic,
						form_data.people,
						form_data.money,
						form_data.user.address,

					],
					{
						from: select_account,
						gas: 6000000,
					}
				);
				alert("發布成功");
				console.log(result);
				refresh();
					close_modal();
			} catch (error) {
				alert("發生錯誤");
				console.log(error);
			}
		};
	};
	return (
		<React.Fragment>
			<Map
				center={search_position}
				zoom={zoom}
				style={{ height: "100%" }}
				onClick={open_modal("add_house")}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				/>
				{/* {house_list.map((item, i) => {
					return <HouseMarker key={i} {...item} showPopup={i === selectedIndex} />;
				})}
				{search_position && (
					<SearchMarker position={search_position} address={search_address} />
				)} */}
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
							<Form.Label>姓名</Form.Label>
							<Form.Control
								type="text"
								value={form_data.name || ""}
								placeholder="請輸入姓名"
								onChange={onChange("name")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>日期</Form.Label>
							<Form.Control
								type="text"
								value={form_data.dates || ""}
								placeholder="請輸入房間名稱"
								onChange={onChange("dates")}
								type="datetime-local"
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>出發地</Form.Label>
							<Form.Control
								type="text"
								value={form_data.destination_lon || ""}
								placeholder="請輸入出發地"
								onChange={onChange("destination_lon")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>目的地</Form.Label>
							<Form.Control
								type="text"
								value={form_data.destination_lat || ""}
								placeholder="請輸入目的地"
								onChange={onChange("destination_lat")}
							/>
						</Form.Group>
						
						<Form.Group>
							<Form.Label>人數</Form.Label>
							<Form.Control
								type="text"
								value={form_data.people || ""}
								placeholder="請輸入人數"
								onChange={onChange("people")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>價錢/人</Form.Label>
							<Form.Control
								type="text"
								value={form_data.money || ""}
								placeholder="請輸入價錢/人"
								onChange={onChange("money")}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>交通工具</Form.Label>
							<Form.Control
								type="text"
								value={form_data.traffic || ""}
								placeholder="請輸入交通工具"
								onChange={onChange("traffic")}
								type="selcet"
							/>
							<option>請選擇</option>
							<option>Uber</option>
							<option>計程車</option>
							<option>自駕</option>
							<option>機車</option>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary"
						size="lg"
						block
						onClick={submit}>
					</Button>
					{"確認送出"}
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	);
}
