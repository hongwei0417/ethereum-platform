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

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }
    
    function create_user(bytes32 uid, bytes32 password) onlyOwner public {
        User user = new User(uid, password, global);
        UM.add_user(uid, address(user));
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
    
    mapping(bytes32 => bytes32) BC_KEYs;
    event show_BC_key(bytes32 key);
    ...
    
    function generate_key(bytes32 uid) onlyOwner public {
        User user = UM.get_user(uid);
        if(user.is_first_login()) {
            bytes32 BC_key = sha256(address(user), block.timestamp);
            BC_KEYs[uid] = BC_key;
            user.set_first_login(false);
            emit show_BC_key(BC_key);
        }
    }
}

contract User {
    
    modifier noReentrancy() {
        require(
            !locked,
            "Reentrant call."
        );
        locked = true;
        _;
        locked = false;
    }
}


contract God is usingProvable {
    function set_ipfs_hash() public {}
    
    
    
}

