// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Announce.sol";
import "./TrafficTransaction.sol";


contract AnnounceManager {
    mapping(bytes32 => Announce) private AnnounceCollection; //所有使用者發布貼文
    mapping(bytes32 => TrafficTransaction) private AnnounceUserCollection; //所有使用者發布貼文
    bytes32[] private announce_id_list; //所有貼文id
    bytes32[] private announce_user_list; //所有按確認的User address

    function create_announce(
        bytes32 announce_id,
        bytes32 name,
        uint256 dates,
        bytes32 destination_lon, 
        bytes32 destination_lat, 
        bytes32 traffic,
        uint256 people,
        uint256 money,
        address user_addr
    ) public {
        Announce announce = new Announce(name, dates, destination_lon,destination_lat,traffic,people,money,User(user_addr));
        AnnounceCollection[announce_id] = announce;
        announce_id_list.push(announce_id);
    }
    
     function create_confirm_user_announce(
        bytes32 announce_id,
        address user_addr
    ) public {
        TrafficTransaction announce = new TrafficTransaction(User(user_addr));
        AnnounceUserCollection[announce_id] = announce;
        announce_user_list.push(announce_id);
    }

    
    
    function get_confirm_user_announce(bytes32 announce_id)
        public
        view
        returns (User _u)
    {
        TrafficTransaction announce = AnnounceUserCollection[announce_id];
        User user = announce.get_u();
        return (user);
    }

    function get_announce(bytes32 announce_id)
        public
        view
        returns (bytes32 _name, uint256 _dates, bytes32 _traffic, uint256 _people, uint256 _people_count, uint256 _money,User _u)
    {
        uint256 people;
        uint256 people_count;
        Announce announce = AnnounceCollection[announce_id];
        bytes32 name = announce.get_name();
        uint256 dates = announce.get_dates();
        bytes32 traffic = announce.get_traffic();
        (people, people_count) = announce.get_people();
        uint256 money = announce.get_money();
        User user = announce.get_u();
        return (name, dates, traffic, people, people_count, money,user);
    }
    
     function get_announce_destination(bytes32 announce_id)
        public
        view
        returns ( bytes32 _destination_lon,bytes32 _destination_lat,User _u)
    {
        Announce announce = AnnounceCollection[announce_id];
        bytes32 destination_lon = announce.get_destination_lon();
        bytes32 destination_lat = announce.get_destination_lat();
        User user = announce.get_u();
        return (destination_lon,destination_lat,user);
    }
    
     function get_all_announces()
        public
        view
        returns (bytes32[] memory ,address[] memory)
    {
        address[] memory announce_addr_list = new address[](announce_id_list.length);
       for (uint256 i = 0; i < announce_id_list.length; i++) {
            announce_addr_list[i] = address(AnnounceCollection[announce_id_list[i]]);
        }
        return (announce_id_list ,announce_addr_list);
    }
    
    function join_announce(bytes32 announce_id) public
    {
        Announce announce = AnnounceCollection[announce_id];
        announce.add_people();
    }

    
 

}