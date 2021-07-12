const express = require("express");
const app = express();
const path = require('path');
const matches = require('./src/backend/matches.json');
const fs = require('fs');
const port = process.env.PORT || 3000;

const Betting = require('./build/contracts/Betting.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

let current_user_address;
let contractInstance;

app.use(express.urlencoded({
	extended: false
}));
app.use('/frontend', express.static(__dirname + '/src/frontend'));
app.use('/backend', express.static(__dirname + '/src/backend'));
app.use(express.json());


async function init() {
	const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:9545/");
	const id = await web3.eth.net.getId();
	const deployedNetwork = Betting.networks[id];
	contractInstance = new web3.eth.Contract(Betting.abi, deployedNetwork.address);

	if (typeof contractInstance !== 'undefined') {
		console.log("contract instance created successfully");
	} else {
		console.log("error");
	}
}

init();

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/src/frontend/main.html'));
});

app.get('/getmatchesjson', (req, res) => {
	res.json(matches);
});

app.post('/sendBet', async (req, res) => {

	// post request format
	// const placedBet = {
	// 	matchID: i, // backend matchIDs start from 0
	// 	betAmount: betAmount,
	// 	typeOfBet: typeOfBet,
	// 	Account: current_account
	// };

	const solRes = await contractInstance.methods.makeMatch(0, 1, 2, 3).send({from: req.body.Account});
	console.log(solRes);


	const solMatches = await contractInstance.methods.matches().call();
	console.log(solMatches);
	
	// TODO send betting info to contract
	// TODO add err checks for post


});



app.listen(port, () => {
	console.log(`listening on port ${port}...`);
});
