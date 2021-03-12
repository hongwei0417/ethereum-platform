pragma solidity >=0.4.22 <0.8.0;
import "./UserManager.sol";
import "./AccountManager.sol";
import "./RoomManager.sol";
import "./TransactionManager.sol";

contract Global {
    address payable public owner; //平台擁有者
    address public um_addr; //用戶管理合員約位址
    address public acm_addr; //帳戶管理合員約位址
    address public rm_addr; //房間管理員位址
    address public tm_addr; //交易管理員位址
    address public tool_addr; //實用工具
    address public OAR; //eth-bridge

    constructor(
        address payable _owner,
        address um,
        address acm,
        address rm,
        address tm,
        address tl,
        address oar
    ) public {
        owner = _owner;
        um_addr = um;
        acm_addr = acm;
        rm_addr = rm;
        tm_addr = tm;
        tool_addr = tl;
        OAR = oar;
    }
}
