var web3 = require("web3");

// var string_to_bytes32 = function() {
// 	let s_hex = web3.utils.stringToHex(s);
// 	let s_bytes = web3.utils.padRight(s_hex, 64); // ? 0x0000....共補滿(32*2)-2個位元
// 	return s_bytes;
// };

// export const bytes32_to_string = (b) => {
// 	let b_string = web3.utils.hexToString(b);
// 	return b_string;
// };

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

readline.question("請選擇模式(1)string=>bytes32 (2)bytes32=>string:\r\n", (mode) => {
	readline.question("請輸入內容:\r\n", (text) => {
		if(mode === "1") {
			let s_hex = web3.utils.stringToHex(text);
			let s_bytes = web3.utils.padRight(s_hex, 64); // ? 0x0000....共補滿(32*2)-2個位元
			console.log(s_bytes)

		} else if(mode === "2") {
			let b_string = web3.utils.hexToString(text);
			console.log(b_string)
		}
		readline.close();
	});
});
