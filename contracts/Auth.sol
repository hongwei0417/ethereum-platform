pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Global.sol";
import "./UserManager.sol";
import "./RoomTransaction.sol";

contract Auth {
    address private owner;
    Global private global;
    UserManager private UM;
    mapping(string => uint) private tokens;
    mapping(bytes32 => bytes32) private BC_KEYs;
    event show_BC_key(bytes32 key);
    event verify_email(string email, uint token);
    event auth_status(bool result);
    
    modifier onlyOwner {
        require(
            tx.origin == global.owner(),
            "Only owner can call this function."
        );
        _;
    }
    
    constructor(address g) public {
        global = Global(g);
        owner = global.owner();
        UM = UserManager(global.um_addr());
    }

    function create_user(bytes32 uid, bytes32 password) public onlyOwner {
        User user = new User(uid, password, global);
        UM.add_user(uid, address(user));
    }

    function login(bytes32 uid, bytes32 password) public view returns(bool) {
        (address user_addr, , ) = UM.get_user(uid);
        User user = User(user_addr);
        return user.get_password() == password;
    }
    
    function get_BC_KEY(bytes32 uid) public view onlyOwner returns(bytes32) {
        return BC_KEYs[uid];
    }
    
    function generate_key(bytes32 uid) public onlyOwner {
        (address user_addr, , ) = UM.get_user(uid);
        User user = User(user_addr);
        if(user.is_first_login()) {
            bytes32 BC_key = keccak256(abi.encodePacked(address(user), uid, block.timestamp));
            BC_KEYs[uid] = BC_key;
            user.set_first_login(false);
            emit show_BC_key(BC_key);
        }
    }
    
    function verify(string memory email, uint token) public view returns(bool) {
        return tokens[email] == token;
    }
    
    function verify(string memory email) public onlyOwner {
        uint random_token = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, email)));
        tokens[email] = random_token;
        emit verify_email(email, random_token);
    }
    
    function authenticate(uint8 action_type, bytes32 uid, bytes32 key, address addr) public onlyOwner {
        bytes32 BC_key = BC_KEYs[uid];
        if(BC_key == key) {
            if(action_type == 1) { //使用者驗證 => 1
                User user = User(addr);
                user.set_verified(true);
            } else if(action_type == 2) { //房間修改驗證 => 2
                Room room = Room(addr);
                room.set_verified(true);
            } else if(action_type == 3) { //房間交易驗證 => 3
                (address user_addr, , ) = UM.get_user(uid);
                RoomTransaction txn = RoomTransaction(addr);
                txn.set_verified(user_addr, true); 
            }
            emit auth_status(true);
        } else {
            emit auth_status(false);
        }
    }
}
