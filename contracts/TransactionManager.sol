pragma solidity >=0.4.22 <0.8.0;
import './Room.sol';
import './RoomTransaction.sol';
import './User.sol';

contract TransactionManager {
    bytes32[] private user_list; //使用者集合
    mapping(bytes32 => mapping(uint => RoomTransaction)) private user_txns; //個別用戶交易
    mapping(bytes32 => uint[]) private user_txn_list; //用戶交易集合
    mapping(address => address[]) private room_txn_list; //房間交易集合
    mapping(address => string) IPFS_hash_table;
    mapping(address => bool) verified;

    function get_user_all_txns(bytes32 uid) public view returns(uint[] memory, address[] memory) {
        uint[] memory txn_times = user_txn_list[uid];
        address[] memory txn_addrs = new address[](txn_times.length);
        for(uint i = 0; i < txn_times.length; i++) {
            uint time = txn_times[i];
            txn_addrs[i] = address(user_txns[uid][time]);
        }
        return (txn_times, txn_addrs);
    }
    
    function get_user_txn(bytes32 uid, uint time) public view returns(address) {
        return address(user_txns[uid][time]);
    }
    
    function add_user_txn(address txn_addr, bytes32 uid, uint time) public {
        user_list.push(uid);
        user_txn_list[uid].push(time);
        user_txns[uid][time] = RoomTransaction(txn_addr);
    }
    
    function add_room_txn(address txn_addr, address room_addr) public {
        room_txn_list[room_addr].push(txn_addr);
    }
    
    function get_room_txn(address addr) public view returns(address[] memory) {
        return room_txn_list[addr];
    }
    
    function set_IPFS_hash(address txn_addr, string memory CID) public {
        IPFS_hash_table[txn_addr] = CID;
    }
    
    function get_IPFS_hash(address txn_addr) public view returns(string memory) {
        return IPFS_hash_table[txn_addr];
    }
}