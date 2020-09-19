export const user_from_contract = (user) => {
	return {
		address: user[0],
		uid: user[1],
		password: user[1],
	};
};
