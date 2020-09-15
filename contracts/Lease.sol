pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

contract Lease {
    User private owner; //擁有者
    string public catagory; //種類
    bool public rented_out; //是否已出租
    uint256 public start_time; //可出租起始時間
    uint256 public end_time; //可出租結束時間
    uint256 public price; //出租金額
    uint256 public quantity; //數量
    string public lat;
    string public lon;

    constructor(
        User u,
        string memory _lat,
        string memory _lon
    ) public {
        owner = u;
        lat = _lat;
        lon = _lon;
    }

    function rent() public {
        rented_out = true;
    }

    function release() public {
        rented_out = false;
    }

    function update_location(string memory _lat, string memory _lon) public {
        lat = _lat;
        lon = _lon;
    }

    function update_room_info(
        string memory ct,
        uint256 st,
        uint256 et,
        uint256 qt
    ) public {
        catagory = bytes(ct).length != 0 ? ct : catagory;
        start_time = st != 0 ? st : start_time;
        end_time = et != 0 ? et : end_time;
        quantity = qt != 0 ? qt : quantity;
    }

    function update_room_price(uint256 pr) public {
        price = pr != 0 ? pr : price;
    }
}