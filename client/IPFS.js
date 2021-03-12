const createClient = require("ipfs-http-client");

// connect to the default API address http://localhost:5001
const client = createClient("http://127.0.0.1:5001");

const data = {
	traveler_addr: "0x2AE0E9da660194D8AC0a4C364d15e6F71847f5a8",
	hotelier_addr: "0x5223629122D7F618B17dDA49D6e66e3779B51923",
	room_addr: "0x3954b876bb9ef5DdD84E85B480B64DE30e39Fcfc",
	price: 1500,
	txn_time: 1615219119,
};

// call Core API methods
client.add(JSON.stringify(data)).then(({ cid }) => {
	console.log(cid);
});
