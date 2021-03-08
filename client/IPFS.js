const createClient = require("ipfs-http-client");

// connect to the default API address http://localhost:5001
const client = createClient("http://127.0.0.1:5002");

const data1 = {
	price: 6666,
	msg: "Today is a good day",
	msg2: "我是Kevin",
};

const data2 = {
	price: 1500,
	msg: "Today is a good day",
	msg2: "Kevin",
};

// call Core API methods
client.add(JSON.stringify(data2)).then(({ cid }) => {
	console.log(cid);
});
