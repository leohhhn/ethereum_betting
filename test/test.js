const Betting = artifacts.require('Betting');
const Web3 = require('web3');

contract('Betting', () => {
	let betting;
	it('should deploy contract properly', async () => {
		betting = await Betting.deployed();
		console.log(betting.address);
		assert(betting.address !== '');
	});

	it('should return correct nth match', async () => {
		let matchID = 2;
		let result = await betting.matchExists_f(matchID);
		assert(result);
	});

	// it('should detect spoofed bet', async () => {
	//
	// 	let result = await betting.placeBet(0, 1, 10).sendTransaction({
	// 		from: accounts[0],
	// 		value: 10000000000
	// 	});
	// 	console.log(result);
	//
	// });

	// it('should return correct nth match', async () => {
	// 	let matchID = 2;
	// 	let result = await betting.matchExists_f(matchID);
	// 	assert(result);
	// });
})
