pragma solidity >=0.4.22 <0.8.0;
import "github.com/oraclize/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {
    string public ETHUSD;
    event LogConstructorInitiated(string nextStep);
    event LogPriceUpdated(string price);
    event LogNewProvableQuery(string description);

    constructor() public payable {
        emit LogConstructorInitiated(
            "Constructor was initiated. Call 'updatePrice()' to send the Provable Query."
        );
    }

    //回傳執行
    function __callback(bytes32 myid, string memory result) public {
        if (msg.sender != provable_cbAddress()) revert();
        ETHUSD = result;
        emit LogPriceUpdated(result);
    }

    //測試官方api
    function updatePrice() public payable {
        if (
            provable_getPrice("URL") >
            address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4).balance
        ) {
            emit LogNewProvableQuery(
                "Provable query was NOT sent, please add some ETH to cover for the query fee"
            );
        } else {
            emit LogNewProvableQuery(
                "Provable query was sent, standing by for the answer.."
            );
            provable_query(
                "URL",
                "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price"
            );
        }
    }

    //測試外部api
    function updatePrice2() public payable {
        if (
            provable_getPrice("URL") >
            address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4).balance
        ) {
            emit LogNewProvableQuery(
                "Provable query was NOT sent, please add some ETH to cover for the query fee"
            );
        } else {
            emit LogNewProvableQuery(
                "Provable query was sent, standing by for the answer.."
            );
            provable_query(
                "URL",
                "json(https://jsonplaceholder.typicode.com/todos/1).title"
            );
        }
    }
}
