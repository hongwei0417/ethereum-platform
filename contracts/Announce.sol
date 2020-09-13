// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./Ownable.sol";
contract Announce {
    mapping(address => User) public Users;
    User[] public user_list;

    function create_user(
        address owner,
        bytes32 name,
        bytes32 dates,
        bytes32 destination,
        bytes32 traffic,
        bytes32 people,
        bytes32 money

    ) public {
        User user = new User(owner, name, dates,destination,traffic,people,money);
        Users[owner] = user;
        user_list.push(user);
    }

    // function verify(bytes32 password) public view returns (bool ok) {
    //     address sender = msg.sender;
    //     if (password == Users[sender].get_password()) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

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
        returns (bytes32 _name, bytes32 _dates, bytes32 _destination, bytes32 _traffic, bytes32 _people, bytes32 _money)
    {
        User user = Users[_user == address(0) ? msg.sender : _user];
        require(user != User(0), "not exists");
        bytes32 name = user.get_name();
        bytes32 dates = user.get_dates();
        bytes32 destination = user.get_destination();
        bytes32 traffic = user.get_traffic();
        bytes32 people = user.get_people();
        bytes32 money = user.get_money();

        return (name, dates, destination,traffic,people,money);
    }
}
