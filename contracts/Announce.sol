// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./Ownable.sol";
contract Announce {
    mapping(bytes32 => Ownable) private Users;

    function create_user(
        bytes32 uid,
        bytes32 name,
        bytes32 dates,
        bytes32 destination,
        bytes32 traffic,
        bytes32 people,
        bytes32 money

    ) public {
        Ownable user = new Ownable(name, dates,destination,traffic,people,money);
        Users[uid] = user;
    }

    uint balance;
    function update(uint count) public returns (address, uint){
        balance += count;
        return (msg.sender, balance);
    }

    function get_user(bytes32 uid)
        public
        view
        returns (bytes32 _name, bytes32 _dates, bytes32 _destination, bytes32 _traffic, bytes32 _people, bytes32 _money)
    {
        Ownable user = Users[uid];
        bytes32 name = user.get_name();
        bytes32 dates = user.get_dates();
        bytes32 destination = user.get_destination();
        bytes32 traffic = user.get_traffic();
        bytes32 people = user.get_people();
        bytes32 money = user.get_money();

        return (name, dates, destination,traffic,people,money);
    }
}
