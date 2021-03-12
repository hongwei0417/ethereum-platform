pragma solidity >=0.4.22 <0.8.0;
import './User.sol';

contract UserAccount {
    User owner;
    uint private balance = 5000;
    uint public create_date;
    uint public update_date;
    
    constructor(User _owner) public {
        owner = _owner;
        create_date = now;
        update_date = now;
    }
    
    function set_balance(uint value) public {
        balance = value;
    }
    
    function get_owner() public view returns(address) {
        return address(owner);
    }
    
    function get_balance() public view returns(uint) {
        return balance;
    }
    
    function send_money(UserAccount receive_account, uint value) public {
        require(balance >= value, "out of balance");
        transfer_ether(receive_account, value);
    }
    
    function transfer_ether(UserAccount receive_account, uint value) private {
        balance -= value;
        receive_account.receive_ether(value);
        update_date = now;
    }
    
    function receive_ether(uint value) public {
        balance += value;
        update_date = now;
    }
}