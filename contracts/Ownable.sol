pragma solidity >=0.4.22 <0.8.0;

contract User {
    address public owner;
    bytes32 private name;
    bytes32 private dates;
    bytes32 private destination;
    bytes32 private traffic;
    bytes32 private people;
    bytes32 private money;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        address _owner,
        bytes32 _name,
        bytes32 _dates,
        bytes32 _destination,
        bytes32 _traffic,
        bytes32 _people,
        bytes32 _money
    ) public {
        require(_owner != address(0x0), "Need owner");
        require(_name.length != 0, "Need name");
        require(_dates.length != 0, "Need dates");
        require(_destination.length != 0, "Need destination");
        require(_traffic.length != 0, "Need traffic");
        require(_people.length != 0, "Need people");
        require(_money.length != 0, "Need money");

        owner = _owner;
        name = _name;
        dates = _dates;
        destination = _destination;
        traffic = _traffic;
        people = _people;
        money = _money;
    }

    function get_name() public view returns (bytes32 _name) {
        return name;
    }

    function set_name(bytes32 _name) public {
        name = _name;
    }

    function get_dates() public view returns (bytes32 _dates) {
        return dates;
    }

    function set_dates(bytes32 _dates) public {
       dates = _dates;
    }

     function get_destination()  public view returns (bytes32 _destination) {
        return destination;
    }

    function set_destination(bytes32 _destination) public {
        destination = _destination;
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

      function get_money() public view returns (bytes32 _money) {
        return money;
    }

    function set_money(bytes32 _money) public {
       money = _money;
    }
}
