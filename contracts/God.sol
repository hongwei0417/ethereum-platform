pragma solidity >=0.4.22 <0.8.0;
import "github.com/oraclize/ethereum-api/provableAPI.sol";

...

pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Global.sol";
import "./UserManager.sol";

contract Auth {
    Global private global;
    UserManager private UM;
    ...    
    
    function create_user(bytes32 uid, bytes32 password) onlyOwner public {
        User user = new User(uid, password, global);
        UM.add_user(uid, address(user));
    }
    
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }
    
    mapping(string => uint) tokens;
    event verify_email(string email, uint token);
    ... 
    
    function verify(string email, bool has_token, uint token) public view onlyOwner returns(bool){
        if(has_token) {
            return tokens[email] == token;
        } else {
            uint random_token = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, email)));
            tokens[email] = random_token;
            emit verify_email(email, token);
            return true;
        }
    }
    
    /////尚未截圖1ok
    
    mapping(bytes32 => bytes32) BC_KEYs;
    event show_BC_key(bytes32 key);
    ...
    
    function generate_key(bytes32 uid) public onlyOwner {
        User user = UM.get_user(uid);
        ...
        
        if(user.is_first_login()) {
            bytes32 BC_key = sha256(address(user), uid);
            BC_KEYs[uid] = BC_key;
            user.set_first_login(false, BC_key);
            emit show_BC_key(BC_key);
        }
    }
    
    //////
}


/////尚未截圖2ok

pragma solidity >=0.4.22 <0.8.0;
import "./Room.sol";
import "./Global.sol";
...

contract User {
    bool private verified = false;
    uint8 private role_id; // 0 => traveler, 1 => hotelier
    ...

    modifier authenticate(uint8 id) {
        require(verified && role_id == id, "verification failed");
        _;
        verified = false;
    }
    
    function create_room(string memory room_id, string memory room_name...) public authenticate(1) onlyOwner {
        Room room = new Room(this, room_name, ...);
        RM.add_user_room(room, address(this), room_id);
        
///////
    }
    
    
    ////尚未截圖5ok
    
    event notification(address user_addr, string txn_id);
    ...
    
    function create_txn(string memory txn_id, address room_addr, uint price) public authenticate(0) onlyOwner {
        Room room = Room(room_addr);
        address traveler_addr = address(this);
        address hotelier_addr = room.get_owner();
        uint txn_time = now;
        UserTransaction txn = new UserTransaction(txn_id, room_addr, traveler_addr, hotelier_addr, price, txn_time);
        TM.add_user_txn(txn, traveler_addr, txn_time);
        TM.add_user_txn(txn, hotelier_addr, txn_time);
        
        emit notification(hotelier_addr, txn_id);
    }
    
    ///////
}

//////尚未截圖3ok

contract Room {
    User private owner;
    bool private verified = false;
    event modification_log(address owner_addr, string op_type, uint op_time, uint price...);
    ...
    
    modifier authenticate() {
        require(verified, "verification failed");
        _;
        verified = false;
    }
    
    function set_room_info(bool is_final, uint _price, uint _quantity, ...) public authenticate onlyOwner {
        if(is_final) {
            bool result = verify_final_offer(_price); //verify
            if(result) {
                final_price = _price;
                final_quantity = _quantity;
                ...
                emit modification_log(address(owner), "UPDATE_FINAL", now, final_price);
            } else {
                revert("no any transaction canceled")
            }
        } else {
            normal_price = _price;
            normal_quantity = _quantity;
            ...
            emit modification_log(address(owner), "UPDATE", now, normal_price);
        }
        
    }
////////////
    
    
    ////尚未截圖4ok
    
    function cehck_available(uint price) public onlyOwner returns(bool) {
        if((normal_price == price || final_price == price) && normal_quantity > 0) {
            return true;
        }
        return true;
    }
    
    
    ////////
    
    
    ////尚未截圖12ok
    
    uint256 private rating_count = 0;
    uint256 private rating_score = 0;
    uint private alert_count = 0;
    bool public has_changed = true;
    ...
    event alert_user(string uid, string msg);
    
    function set_rating(uint score) public onlyOwner {
        rating_score = score;
        if(!check_status()) {
            User user = User(hotelier_addr);
            string memory uid = user.get_uid();
            if(alert_count > 5 && !has_changed) {
                punishment();
                alert_count = 0;
                emit alert_user(uid, "punishment");
            } else {
                emit alert_user(uid, "warning");
                alert_count = alert_count + 1;
            }
        }
    }
    
    /////
    
    
}




pragma solidity >=0.4.22 <0.8.0;
import "./UserTransaction.sol";
import "github.com/oraclize/ethereum-api/provableAPI.sol";
...

contract UserTransaction is usingProvable {
    address constant private traveler_addr;
    address constant private hotelier_addr;
    address private room_addr;
    bool private active = false;
    bool private check_in = false;
    bool private check_out = false;
    bool private complete = false;
    uint256 private price;
    bytes32[] provable_ids; //query ids
    bool[] IPFS_results; //match result
    ...
    
    function verify_txn() public payable onlyOwner {
        address txn_addr = address(this);
        string memory CID = TM.get_IPFS_hash(txn_addr);
        //query IPFS
        bytes32 queryId1 = provable_query("IPFS", "json(" + CID + ").travler_addr");
        ...
        provable_ids[0] = queryId1;
        ...
    }
    
    /////尚未截圖6ok

    function accept(address user_addr) public authenticate(1) onlyOwner {
        hotelier_addr = user_addr;
        verify_txn();
    }
    
    /////////
    
    /////尚未截圖7ok
    
    function __callback(bytes32 id, string memory result) public{
        require(msg.sender != provable_cbAddress());

        if(provable_ids[0] != bytes32(0) && provable_ids[0] == id) {
            IPFS_results.push(traveler_addr == address(result));
        } else if...
        
        if(IPFS_results.length == PARAMETERS_NUMBER) {
            bool ok = true;
            for(uint i = 0; i < IPFS_results.length; i++) {
                if(!IPFS_results[i]) ok = false;
            }
            if(ok) {
                active = true;
                delete IPFS_results;
            }
        }
    }
    
    //////////
    
    /////尚未截圖10ok
    
    function complete_txn(address user_addr) public payable authenticate onlyOwner is_check_out {
        if(user_addr == traveler_addr) {
            traveler_check = true;
        } else if(user_addr == hotelier_addr) {
            hotelier_check = true;
        }
        
        if(!complete && traveler_check && hoteler_check) {
            transfer_money();
            complete_time = now;
            complete = true;
        }
    }
    
    function transfer_money() private onlyOwner {
        UserAccount traveler_account = User(traveler_addr).get_account();
        UserAccount hotelier_account = User(hotelier_addr).get_account();
        hotelier_account.send_money(traveler_account, price);
    }
    
    /////////
    
    ////尚未截圖11ok
    
    function rate_photo(uint256 score, uint256 avg_score) public authenticate(0) onlyOwner is_check_in returns(bool) {
        Room room = Room(room_addr);
        uint256 rating_count = user.get_rating_count();
        uint256 photo_score = room.get_photo_score();
        uint256 caculate_score = (photo_score*rating_count)+score)/(rating_count+1);
        if(rating_count > 10 && caculate_score == avg_score) {
            room.set_rating(caculate_score);
        }
        room.set_rating_count(rating_count + 1);
    }
    
     function rate_txn(uint action_user, uint256 score, uint256 avg_score) public authenticate onlyOwner is_check_out returns(bool) {
         User user;
         
         if(action_user == 0) { //traveler
            user = User(hotelier_addr);
         } else if(action_user == 1) { //hotelier
            user = User(traveler_addr);
         }
     
     //////
     
        uint256 rating_count = user.get_rating_count();
        uint256 total_score = room.get_total_score();
        uint256 caculate_score = (total_score*rating_count)+score)/(rating_count+1);
        if(rating_count > 10 && caculate_score == avg_score) {
            user.set_rating(caculate_score);
        }
        user.set_rating_count(rating_count + 1);
     }
    
}


/////尚未截圖9ok

pragma solidity >=0.4.22 <0.8.0;
import "./UserTransaction.sol";
...

contract TransactionManager {
    mapping(address => string) IPFS_hash_table;
    mapping(bytes32 => mapping(uint256 => UserTransaction)) private user_txns;
    ...
    
    function set_IPFS_hash(address txn_addr, string memory CID) public onlyOwner {
        IPFS_hash_table[txn_addr] = CID;
    }
    
    function get_IPFS_hash(address txn_addr) public onlyOwner returns(string memory) {
        return IPFS_hash_table[txn_addr];
    }

/////////
}

