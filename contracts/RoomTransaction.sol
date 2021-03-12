pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Transaction.sol";
import "./Room.sol";
import "./Global.sol";
import "./AccountManager.sol";
import "./TransactionManager.sol";
import "./UserAccount.sol";
import "./Tool.sol";
import "github.com/oraclize/ethereum-api/provableAPI.sol";

//實作 Transaction
contract RoomTransaction is usingProvable {
    Global private global; //全域管理者
    AccountManager private ACM; //帳戶管理員
    TransactionManager private TM; //交易管理員
    Tool private tool; //實用工具
    User private traveler;
    User private hotelier;
    Room private room;
    uint256 private price;
    bool private check_in = false; //入房
    bool private check_out = false; //退房
    bool private established = false; //訂單成立
    bool private completed = false; //訂單完成
    bool private comment_end = false; //評價結束
    uint256 private start_time; //訂單開始時間
    uint256 private end_time; //訂單結束時間
    bytes32[] public provable_ids = new bytes32[](1); //query ids
    bool[] public IPFS_results = [false]; //match result
    bool[] public rating_stauts = [false, false, false]; // [room(photo), taveler_txn, hotelier_txn]
    mapping(address => bool) private checked; //交易確認狀態
    mapping(address => bool) private verified; //驗證狀態
    event rating_log(uint8 r_type, bool stauts, uint256 avg, uint256 caculate);
    event log(string query_str);
    string public result;

    modifier authenticate(address addr, bool reset) {
        require(verified[addr], "verification failed");
        _;
        if(reset) verified[addr] = false;
    }
    
    modifier onlyOwner {
        require(
            tx.origin == global.owner(),
            "Only owner can call this function"
        );
        _;
    }
    
    modifier is_check_in {
        require(
            check_in,
            "Have not checked in"
        );
        _;
    }
    
    modifier is_check_out {
        require(
            check_out,
            "Have not checked out"
        );
        _;
    }

    constructor(
        User t,
        User h,
        Room rm,
        Global g
    ) public payable {
        uint txn_price;
        (uint _price, uint _final_price) = rm.get_price();
        if(rm.is_final()) txn_price = _final_price;
        else txn_price = _price;
        traveler = t;
        hotelier = h;
        room = rm;
        price = txn_price;
        start_time = now;
        global = g;
        ACM = AccountManager(g.acm_addr());
        TM = TransactionManager(g.tm_addr());
        tool = Tool(g.tool_addr());
        OAR = OracleAddrResolverI(g.OAR()); //eth-bridge
    }

    function get_txn_info() public view returns(address[] memory, uint256) {
        address[] memory info = new address[](3);
        info[0] = address(traveler);
        info[1] = address(hotelier);
        info[2] = address(room);
        return (info, price);
    }

    function get_txn_status() public view returns(bool[] memory) {
        bool[] memory status = new bool[](6);
        status[0] = established;
        status[1] = check_in;
        status[2] = check_out;
        status[3] = checked[address(traveler)];
        status[4] = checked[address(hotelier)];
        status[5] = completed;
        return status;
    }

    function get_txn_times() public view returns(uint256[] memory) {
        uint256[] memory times = new uint256[](2);
        times[0] = start_time;
        times[1] = end_time;
        return times;
    }
    
    function set_verified(address user_addr, bool status) public onlyOwner {
        verified[user_addr] = status;
    }
    
    function accept() public authenticate(address(hotelier), true) onlyOwner {
        verify_txn();
    }
    
    function room_check() public authenticate(address(traveler), true) onlyOwner {
        if(check_in) {
            check_out = true;
        } else {
            check_in = true;
        }
    }

    function check_txn(address user_addr) public onlyOwner is_check_in {
        checked[user_addr] = true;
    }
    
    function complete_txn() public authenticate(address(hotelier), true) onlyOwner is_check_out {
        if (!completed && checked[address(traveler)] && checked[address(hotelier)]) {
            transfer_money();
            end_time = now;
            completed = true;
        }
    }

    function transfer_money() private onlyOwner{
        UserAccount traveler_account = UserAccount(ACM.get_account(traveler.get_uid()));
        UserAccount hotelier_account = UserAccount(ACM.get_account(hotelier.get_uid()));
        traveler_account.send_money(hotelier_account, price);
    }
    
    function __callback(bytes32 id, string memory _result) public {
        require(tx.origin == provable_cbAddress());

        if(provable_ids[0] != bytes32(0) && provable_ids[0] == id) {
            string memory p = tool.uint2str(price);
            IPFS_results[0] = (keccak256(abi.encodePacked(p)) == keccak256(abi.encodePacked(_result)));
        }
        
        if(IPFS_results.length == 1) {
            bool ok = true;
            for(uint i = 0; i < IPFS_results.length; i++) {
                if(!IPFS_results[i]) ok = false;
            }
            if(ok) { //交易驗證證成功
                established = true;
                // delete IPFS_results;
            }
        }
        result = _result;
    }
    
    function verify_txn() public payable {
        address txn_addr = address(this);
        string memory CID = TM.get_IPFS_hash(txn_addr);
        string memory query_str = string(abi.encodePacked("json(", CID, ").price"));
        bytes32 queryId1 = provable_query("IPFS", query_str); //query IPFS
        provable_ids[0] = queryId1;
        emit log(query_str);
    }
    
    function rate_photo(uint256 score, uint256 avg_score) public authenticate(address(traveler), true) onlyOwner is_check_in {
        uint256 rating_count = room.rating_count();
        uint256 rating_score = room.rating_score();
        uint256 calculate_score = ((rating_score*rating_count)+score)/(rating_count+1);
        if(!rating_stauts[0]) {
            if(calculate_score == avg_score) {
                room.set_rating(calculate_score); //success
                rating_stauts[0] = true;
                emit rating_log(1, true, avg_score, calculate_score); //fail
            } else {
                emit rating_log(1, false, avg_score, calculate_score); //fail
            }
        }
    }
    
    function rate_txn(uint action_user, uint256 score, uint256 avg_score) public authenticate(address(traveler), false) onlyOwner is_check_out {
        User user;
        uint rating_index;
        if(action_user == 0) {
            user = hotelier;
            rating_index = 1;
        }
        else if(action_user == 1) {
            user = traveler;
            rating_index = 2;
        }
        else revert("user role id error");
        uint256 rating_count = user.rating_count();
        uint256 rating_score = user.rating_score();
        uint256 calculate_score = ((rating_score*rating_count)+score)/(rating_count+1);
        if(!rating_stauts[rating_index]) {
            if(calculate_score == avg_score) {
                user.set_rating(calculate_score);
                rating_stauts[rating_index] = true;
                emit rating_log(2, true, avg_score, calculate_score); //fail
            } else {
                emit rating_log(2, false, avg_score, calculate_score); //fail
            }
        }
    }
    
    function receive() external payable {}
    function fallback() external payable {}
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
