pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./TransactionManager.sol";
import "./Global.sol";
import "./RoomTransaction.sol";
import "./UserAccount.sol";
import "./AccountManager.sol";

contract Room {
    Global private global;
    TransactionManager private TM;
    AccountManager private ACM;
    User private owner; //擁有者
    string private room_name; //房間名稱
    string private category; //種類
    uint256 private start_time; //可出租起始時間
    uint256 private end_time; //可出租結束時間
    uint256 private price; //出租金額
    uint256 private final_price; //最終價格
    uint256 private quantity; //數量
    string private lat; //緯度
    string private lon; //經度
    bool public verified = false;
    bool public is_final = false;
    uint256 public rating_count = 0;
    uint256 public rating_score = 0;
    uint private alert_count = 0;
    bool public has_changed = false;
    event modification_log(address owner_addr, string op_type, uint op_time, uint price);
    event alert_user(bytes32 uid, string msg);
    
    modifier authenticate() {
        require(verified, "verification failed");
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
        Global g,
        TransactionManager tm,
        AccountManager acm,
        User u,
        string memory rn,
        string memory _lat,
        string memory _lon
    ) public {
        owner = u;
        room_name = rn;
        lat = _lat;
        lon = _lon;
        global = g;
        TM = tm;
        ACM = acm;
    }

    function get_times()
        public
        view
        returns (
            uint256,
            uint256
        )
    {
        return (start_time, end_time);
    }
    
    function get_owner() public view returns(address) {
        return address(owner);
    }
    
    function get_all_info()
        public
        view
        returns (
            address,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            string memory,
            string memory
        )
    {
        address owner_addr = address(owner);
        return (
            owner_addr,
            room_name,
            category,
            start_time,
            end_time,
            quantity,
            lat,
            lon
        );
    }
    
    function get_price() public view onlyOwner returns(uint256, uint256) {
        return (price, final_price);
    }
    
    function set_room_info(string memory rn, string memory ctg, uint st, uint et, uint q) public onlyOwner {
        room_name = rn;
        category = ctg;
        start_time = st;
        end_time = et;
        quantity = q;
    }
    
    function set_verified(bool status) public onlyOwner {
        verified = status;
    }
    
    function set_changed(bool status) public onlyOwner {
        has_changed = status;
    }
    
    function cehck_available(uint p) public view returns(bool) {
        if(is_final) {
            return (final_price == p && quantity > 0 && start_time <= now && now <= end_time);
        } else {
            return (price == p && quantity > 0  && start_time <= now && now <= end_time);
        }
    }

    function set_location(string memory _lat, string memory _lon) public authenticate {
        lat = _lat;
        lon = _lon;
    }
    
    function set_final(bool f) public onlyOwner {
        is_final = f;
    }
    
    function verify_final_offer(uint256 _price) private view returns(bool) {
        address[] memory txns = TM.get_room_txn(address(this));
        uint256 checkDay = now - (86400 * 7); //一個禮拜內
        for(uint i = 0; i < txns.length; i++) {
            RoomTransaction rt = RoomTransaction(txns[i]);
            uint256[] memory txn_times = rt.get_txn_times();
            bool[] memory status = rt.get_txn_status();
            (,uint256 p) = rt.get_txn_info();
            if(status[2] && txn_times[1] >= checkDay && _price >= p) {
                return false;
            }
        }
        return true;
    }

    function set_room_price(bool _is_final, uint256 _price) public authenticate onlyOwner {
        if(_is_final) {
            bool result = verify_final_offer(_price); //驗證價格
            if(result) {
                final_price = _price;
                is_final = true;
                emit modification_log(address(owner), "UPDATE_FINAL", now, final_price);
            } else {
                revert("no any transaction canceled");
            }
        } else {
            price = _price;
            emit modification_log(address(owner), "UPDATE", now, price);
        }
    }
    
    function set_rating(uint score) public onlyOwner {
        rating_score = score;
        User user = User(owner);
        bytes32 uid = user.get_uid();
        if(rating_count >= 10 && rating_score < 5) {
            if(alert_count > 5 && !has_changed) {
                punishment();
                alert_count = 0;
                emit alert_user(uid, "punishment");
            } else {
                emit alert_user(uid, "warning");
                alert_count = alert_count + 1;
            }
        }
        rating_count += 1;
    }
    
    function punishment() private onlyOwner {
        address[] memory txns = TM.get_room_txn(address(this));
        for(uint i = 0; i < txns.length; i++) {
            RoomTransaction rt = RoomTransaction(txns[i]);
            bool[] memory status = rt.get_txn_status();
            (address[] memory addrs, uint256 p) = rt.get_txn_info();
            if(status[2]) {
                User traveler = User(addrs[0]);
                User hotelier = User(addrs[1]);
                UserAccount traveler_AC = UserAccount(ACM.get_account(traveler.get_uid()));
                UserAccount hotelier_AC = UserAccount(ACM.get_account(hotelier.get_uid()));
                hotelier_AC.send_money(traveler_AC, p / 5);
            }
        }
    }
}
