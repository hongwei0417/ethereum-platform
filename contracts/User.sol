pragma solidity >=0.4.22 <0.8.0;
import "./UserAccount.sol";
import "./AccountManager.sol";
import "./RoomTransaction.sol";
import "./TransactionManager.sol";
import "./RoomManager.sol";
import "./Room.sol";
import "./Global.sol";

contract User {
    Global private global; //全域管理者
    AccountManager private ACM; //帳戶管理員
    RoomManager private RM; //房間管理員
    TransactionManager private TM; //交易管理員
    bytes32 private uid; //使用者ID
    bytes32 private password; //密碼
    bool public is_first_login = true;
    bool public verified = false;
    uint8 public role_id = 0; // 0 => traveler, 1 => hotelier
    uint256 public rating_count = 0;
    uint256 public rating_score = 0;
    event notification(bytes32 uid, uint txn_time);
    
    modifier authenticate(uint8 id) {
        require(verified && role_id == id, "verification failed");
        _;
        verified = false;
    }
    
    modifier onlyOwner {
        require(
            tx.origin == global.owner(),
            "Only owner can call this function."
        );
        _;
    }

    constructor(
        bytes32 _uid,
        bytes32 _password,
        Global g
    ) public {
        require(_uid.length != 0, "Need id");
        require(_password.length != 0, "Need password");

        address acm_addr = g.acm_addr(); //取得帳戶管理員位址
        address rm_addr = g.rm_addr(); //取得租借物管理員位址
        address tm_addr = g.tm_addr(); //取得交易管理員位址
        global = g;
        ACM = AccountManager(acm_addr);
        RM = RoomManager(rm_addr);
        TM = TransactionManager(tm_addr);
        uid = _uid;
        password = _password;
        ACM.add_account(uid, new UserAccount(this)); //加入帳戶管理
    }
    
    function set_role(uint8 id) public onlyOwner {
        role_id = id;
    }
    
    function set_verified(bool status) public onlyOwner {
        verified = status;
    }
    
    function set_first_login(bool f) public onlyOwner {
        is_first_login = f;
    }

    function get_uid() public view  returns(bytes32) {
        return uid;
    }

    function get_password() public view  returns (bytes32) {
        return password;
    }

    function set_password(bytes32 _password) onlyOwner public {
        password = _password;
    }

    function get_account() public view onlyOwner returns (address) {
        return ACM.get_account(uid);
    }
    
    function set_rating(uint256 score) public onlyOwner {
        rating_score = score;
        rating_count += 1;
    }

    // 新增房間
    function create_room(bytes32 room_id, string memory room_name, string memory lon, string memory lat) public authenticate(1) onlyOwner {
        Room room = new Room(global, TM, ACM, this, room_name, lon, lat);
        RM.add_user_rooms(room, uid, room_id);
    }

    // 新增房間交易
    function create_room_txn(address txn_addr, address room_addr, bytes32 traveler_uid, bytes32 hotelier_uid) public authenticate(0) onlyOwner {
        uint256 txn_time = now;
        TM.add_user_txn(txn_addr, traveler_uid, txn_time); //將交易儲存進旅遊者
        TM.add_user_txn(txn_addr, hotelier_uid, txn_time); //將交易儲存進民宿業者
        TM.add_room_txn(txn_addr, room_addr); //將交易儲存進房間列表
        emit notification(hotelier_uid, txn_time);
    }
    
}
