pragma solidity >=0.4.22 <0.8.0;
import './User.sol';

interface Transaction {
    function get_txn_info() view external returns(address[] memory, uint256);
    function get_txn_status() view external returns(bool[] memory);
    function get_txn_times() view external returns(uint[] memory);
    function complete_txn() external returns(bool);
    function verify_txn(address user_addr) view external returns(string memory);
}