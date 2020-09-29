// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./Ownable.sol";
import "./User.sol";
contract Announce {
    mapping(bytes32 => Ownable) private Users;
    bytes32[] private id_list; //使用者名稱集合

    function create_user(
        bytes32 uid,
        bytes32 name,
        uint256 dates,
        bytes32 destination_lon, 
        bytes32 destination_lat, 
        bytes32 traffic,
        bytes32 people,
        uint256 money,
        address user_addr
    ) public {
        Ownable user = new Ownable(name, dates, destination_lon,destination_lat,traffic,people,money,User(user_addr));
        Users[uid] = user;
        id_list.push(uid);
    }

    uint balance;
    function update(uint count) public returns (address, uint){
        balance += count;
        return (msg.sender, balance);
    }

    function get_user(bytes32 uid)
        public
        view
        returns (bytes32 _name, uint256 _dates, bytes32 _traffic, bytes32 _people, uint256 _money,User _u)
    {
        Ownable user = Users[uid];
        bytes32 name = user.get_name();
        uint256 dates = user.get_dates();
        bytes32 traffic = user.get_traffic();
        bytes32 people = user.get_people();
        uint256 money = user.get_money();
        User u = user.get_u();
        return (name, dates,traffic,people,money,u);
    }
    
     function get_user_destination(bytes32 uid)
        public
        view
        returns ( bytes32 _destination_lon,bytes32 _destination_lat,User _u)
    {
        Ownable user = Users[uid];
        bytes32 destination_lon = user.get_destination_lon();
        bytes32 destination_lat = user.get_destination_lat();
          User u = user.get_u();
        return (destination_lon,destination_lat,u);
    }
    
     function get_all_user()
        public
        view
        returns (bytes32[] memory ,address[] memory)
    {
        address[] memory addressmessage = new address[](id_list.length);
       for (uint256 i = 0; i < id_list.length; i++) {
            addressmessage[i] = address(Users[id_list[i]]);
        }
        return (id_list,addressmessage);
    }
  
}
