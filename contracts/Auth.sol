pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

contract Auth {
    mapping(address => User) public Users;
    User[] public user_list;

    function create_user(
        address owner,
        bytes32 name,
        bytes32 password
    ) public {
        User user = new User(owner, name, password);
        Users[owner] = user;
        user_list.push(user);
    }

    function verify(bytes32 password) public view returns (bool ok) {
        address sender = msg.sender;
        if (password == Users[sender].get_password()) {
            return true;
        } else {
            return false;
        }
    }

    function get_user_list()
        public
        view
        returns (address[] memory _owners, bytes32[] memory _names)
    {
        address[] memory owners = new address[](user_list.length);
        bytes32[] memory names = new bytes32[](user_list.length);

        for (uint256 i = 0; i < user_list.length; i++) {
            owners[i] = user_list[i].owner();
            names[i] = user_list[i].get_name();
        }
        return (owners, names);
    }

    function get_user(address _user)
        public
        view
        returns (bytes32 _name, bytes32 _password)
    {
        User user = Users[_user == address(0) ? msg.sender : _user];
        require(user != User(0), "not exists");
        bytes32 name = user.get_name();
        bytes32 password = user.get_password();

        return (name, password);
    }
}
