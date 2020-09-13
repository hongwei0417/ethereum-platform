// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract User {
    address public owner;
    bytes32 private name;
    bytes32 private password;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        address _owner,
        bytes32 _name,
        bytes32 _password
    ) public {
        require(_owner != address(0x0), "Need owner");
        require(_name.length != 0, "Need name");
        require(_password.length != 0, "Need password");

        owner = _owner;
        name = _name;
        password = _password;
    }

    function get_name() public view returns (bytes32 _name) {
        return name;
    }

    function set_name(bytes32 _name) public {
        name = _name;
    }

    function get_password() public view returns (bytes32 _password) {
        return password;
    }

    function set_password(bytes32 _password) public {
        password = _password;
    }
}
