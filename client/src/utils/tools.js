import web3 from "web3";

export const string_to_bytes32 = (s) => {
	let s_hex = web3.utils.stringToHex(s);
	let s_bytes = web3.utils.padRight(s_hex, 64); // ? 0x0000....共補滿(32*2)-2個位元
	return s_bytes;
};

export const bytes32_to_string = (b) => {
	let b_string = web3.utils.hexToString(b);
	return b_string;
};
