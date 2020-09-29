pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

contract Ownable {
    address public owner;
    bytes32 private name;
    uint256 private dates;
    bytes32 private destination_lon;
    bytes32 private destination_lat;
    bytes32 private traffic;
    bytes32 private people;
    uint256 private money;
    User private u;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
   uint balance;
    function update(uint count) public returns (address, uint){
        balance += count;
        return (msg.sender, balance);
    }

    constructor(
        // address _owner,
        bytes32 _name,
        uint256 _dates,
        bytes32 _destination_lon,
        bytes32 _destination_lat,
        bytes32 _traffic,
        bytes32 _people,
        uint256 _money,
        User _u
    ) public {
        // require(_owner != address(0x0), "Need owner");
        require(_name.length != 0, "Need name");
        //require(_dates.length != 0, "Need dates");
        require(_destination_lon.length != 0, "Need destination");
        require(_destination_lat.length != 0, "Need destination");
        require(_traffic.length != 0, "Need traffic");
        require(_people.length != 0, "Need people");
        // require(_money.length != 0, "Need money");

        // owner = _owner;
        name = _name;
        dates = _dates;
        destination_lon = _destination_lon;
        destination_lat = _destination_lat;
        traffic = _traffic;
        people = _people;
        money = _money;
        u=_u;
        
    }

    function get_name() public view returns (bytes32 _name) {
        return name;
    }

    function set_name(bytes32 _name) public {
        name = _name;
    }

    function get_dates() public view returns (uint256 _dates) {
        return dates;
    }

    function set_dates(uint256 _dates) public {
       dates = _dates;
    }

     function get_destination_lon()  public view returns (bytes32 _destination_lon) {
        return destination_lon;
    }

    function set_destination_lon(bytes32 _destination_lon) public {
        destination_lon = _destination_lon;
    }
    
     function get_destination_lat()  public view returns (bytes32 _destination_lat) {
        return destination_lat;
    }

    function set_destination_lat(bytes32 _destination_lat) public {
        destination_lat = _destination_lat;
    }

     function get_traffic() public view returns (bytes32 _traffic) {
        return traffic;
    }

    function set_traffic(bytes32 _traffic) public {
       traffic = _traffic;
    }

     function get_people() public view returns (bytes32 _people) {
        return people;
    }

    function set_people(bytes32 _people) public {
       people = _people;
    }

      function get_money() public view returns (uint256 _money) {
        return money;
    }

    function set_money(uint256 _money) public {
       money = _money;
    }
    
     function get_u() public view returns (User _u) {
        return u;
    }

    function set_u(User _u) public {
       u = _u;
    }
    
      function update_ownable_info(
        bytes32 _name, 
        uint256 _dates, 
        bytes32 _destination_lon, 
        bytes32 _destination_lat, 
        bytes32 _traffic,
        bytes32 _people, 
        uint256 _money)
        public
    {
        name =  _name ;
        dates = _dates ;
        destination_lon = _destination_lon;
        destination_lat = _destination_lat;
        traffic =  _traffic;
        people = _people;
        money = _money;
    }
}
