pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./AccountManager.sol";
import "./TransactionManager.sol";
import "./Transaction.sol";
import "./Global.sol";


contract CouponManager {
    Global private global; //全域管理者
    AccountManager private ACM; //帳戶管理員
    TransactionManager private TM; //交易管理員
    uint[] private all_coupon_list; //所有優惠券
    uint[] private all_txn_list; //所有交易
    mapping(uint => Coupon) coupon_map;
    mapping(uint => Txn) txn_map;
    mapping(address => uint[]) user_coupons;
    mapping(address => uint[]) user_txns;
    
    struct Coupon {
        address owner;
        address hotelier;
        uint issued_time;
        uint expired_time;
        uint current_price;
        uint original_price;
        string summary;
        bool selling;
    }
    

    struct Txn {
        address seller;
        address buyer;
        uint coupon_id;
        uint price;
        uint txn_time;
        bool seller_check;
        bool buyer_check;
        bool completed;
    }
    
    modifier onlyOwner {
        require(
            tx.origin == global.owner(),
            "Only owner can call this function"
        );
        _;
    }
    
    constructor(address g) public {
        global = Global(g);
        ACM = AccountManager(global.acm_addr());
        TM = TransactionManager(global.tm_addr());
    }
    
    function get_coupon_list() public view onlyOwner returns(uint[] memory) {
        return all_coupon_list;
    }
    
    function get_txn_list() public view onlyOwner returns(uint[] memory) {
        return all_txn_list;
    }
    
    function get_user_coupons(address user_addr) public view onlyOwner returns(uint[] memory) {
        return user_coupons[user_addr];
    }
    
    function get_user_txns(address user_addr) public view onlyOwner returns(uint[] memory) {
        return user_txns[user_addr];
    }
    
    function get_coupon_info(uint cid) public view onlyOwner returns(address, address, uint, uint, uint, string memory){
        return(
            coupon_map[cid].owner,
            coupon_map[cid].hotelier,
            coupon_map[cid].issued_time,
            coupon_map[cid].expired_time,
            coupon_map[cid].original_price,
            coupon_map[cid].summary
        );
    }
    
    function get_coupon_status(uint cid) public view onlyOwner returns(uint, bool) {
        return(coupon_map[cid].current_price, coupon_map[cid].selling);
    }
    
    function issue_coupon(address user_addr, uint expired, uint p, string memory s) public onlyOwner {
        User user = User(user_addr);
        if(user.role_id() == 1) {
            uint cid = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, user.get_uid())));
            Coupon memory coupon = Coupon(user_addr, user_addr, now, expired, p, p, s, true);
            coupon_map[cid] = coupon;
            user_coupons[user_addr].push(cid);
            all_coupon_list.push(cid);
        }
    }
    
    function set_coupon(uint cid, address user_addr, bool s, uint p) public onlyOwner {
        if(has_coupon(cid, user_addr)) {
            coupon_map[cid].current_price = p;
            coupon_map[cid].selling = s;
        }
    }
    
    function get_txn_info(uint tid) public view onlyOwner returns(address, address, uint, uint, uint) {
        return(
            txn_map[tid].seller,
            txn_map[tid].buyer,
            txn_map[tid].coupon_id,
            txn_map[tid].price,
            txn_map[tid].txn_time
        );
    }
    
    function get_txn_status(uint tid) public view onlyOwner returns(bool, bool, bool) {
        return(
            txn_map[tid].buyer_check,
            txn_map[tid].seller_check,
            txn_map[tid].completed
        );
    }
    
    function buy_coupon(uint cid, address user_addr) public onlyOwner {
        User user = User(user_addr);
        if(user.role_id() == 0 && coupon_map[cid].owner != user_addr && coupon_map[cid].selling) {
            uint tid = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, user.get_uid())));
            Txn memory txn = Txn(coupon_map[cid].owner, user_addr, cid, coupon_map[cid].current_price, now, false, false, false);
            txn_map[tid] = txn;
            user_txns[user_addr].push(tid); //buyer
            user_txns[coupon_map[cid].owner].push(tid); //seller
            all_txn_list.push(tid);
            coupon_map[cid].selling = false;
        }
    }
    
    function sell_coupon(uint cid, address user_addr, uint p) public onlyOwner {
        if(has_coupon(cid, user_addr)) {
            coupon_map[cid].current_price = p;
            coupon_map[cid].selling = true;
        }
    }
    
    function check_txn(uint tid, address user_addr) public onlyOwner {
        if(has_txn(tid, user_addr)) {
            if(txn_map[tid].buyer == user_addr) {
                txn_map[tid].buyer_check = true;
            } else if(txn_map[tid].seller == user_addr) {
                txn_map[tid].seller_check = true;
            }
        }
    }
    
    function complete_txn(uint tid, address seller_addr) public onlyOwner {
        uint cid = txn_map[tid].coupon_id;
        if(txn_map[tid].seller == seller_addr && has_txn(tid, seller_addr) && has_coupon(cid, seller_addr)) {
            if(txn_map[tid].buyer_check && txn_map[tid].seller_check) {
                //remove cid from seller
                uint[] memory new_cids = remove_cid_from_array(cid, seller_addr);
                user_coupons[seller_addr] = new_cids;
                
                //add cid to buyer
                coupon_map[cid].owner = txn_map[tid].buyer;
                coupon_map[cid].selling = false;
                user_coupons[txn_map[tid].buyer].push(cid);
                txn_map[tid].completed = true;
                
                //send money
                transfer_money(seller_addr, txn_map[tid].buyer, coupon_map[cid].current_price);
            }
        }
    }
    
    function remove_cid_from_array(uint cid, address user_addr) view private returns(uint[] memory) {
        uint count = user_coupons[user_addr].length;
        uint[] memory new_cids = new uint[](count-1);
        uint n = 0;
        for(uint i = 0; i < count; i++) {
            if(user_coupons[user_addr][i] != cid) {
                new_cids[n] = user_coupons[user_addr][i];
                n += 1;
            }
        }
        return new_cids;
    }
    
    function has_coupon(uint cid, address user_addr) private view returns(bool) {
        for(uint i = 0; i < user_coupons[user_addr].length; i++) {
            if(user_coupons[user_addr][i] == cid) return true;
        }
        return false;
    }
    
    function has_txn(uint tid, address user_addr) private view returns(bool) {
        for(uint i = 0; i < user_txns[user_addr].length; i++) {
            if(user_txns[user_addr][i] == tid) return true;
        }
        return false;
    }
    
    function transfer_money(address s, address b, uint price) private onlyOwner {
        User seller = User(s);
        User buyer = User(b);
        UserAccount seller_account = UserAccount(ACM.get_account(seller.get_uid()));
        UserAccount buyer_account = UserAccount(ACM.get_account(buyer.get_uid()));
        buyer_account.send_money(seller_account, price);
    }
}