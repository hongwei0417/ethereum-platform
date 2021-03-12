pragma solidity >=0.4.22 <0.8.0;
import './Room.sol';

contract RoomManager {
    mapping(bytes32 => mapping(bytes32 => Room)) private user_rooms; //用戶租借物
    mapping(bytes32 => bytes32[]) private user_rooms_list; //用戶所擁有租借物集合
    bytes32[] private user_list; //使用者名稱集合
    
    function get_user_all_rooms(bytes32 uid) public view returns(bytes32[] memory, address[] memory) {
        bytes32[] memory user_lids = user_rooms_list[uid];
        address[] memory room_addrs = new address[](user_lids.length);
        for(uint i = 0; i < user_lids.length; i++) {
            bytes32 lid = user_lids[i];
            room_addrs[i] = address(user_rooms[uid][lid]);
        }
        return (user_lids, room_addrs);
    }
    
    function get_user_rooms(bytes32 uid, bytes32 rid) public view returns(address) {
        return address(user_rooms[uid][rid]);
    }
    
    function add_user_rooms(Room r, bytes32 uid, bytes32 rid) public {
        user_list.push(uid);
        user_rooms_list[uid].push(rid);
        user_rooms[uid][rid] = r;
    }
}