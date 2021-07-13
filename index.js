const express = require("express");
const app = express();
const path = require('path');
const matchesObj = require('./src/backend/matches.json');
const fs = require('fs');
const port = process.env.PORT || 3000;

const Betting = require('./build/contracts/Betting.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

let current_user_address;
let contractInstance;
let contractOwner;

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

	let matches = matchesObj.matches;

	contractOwner = await contractInstance.methods.owner().call();

	let contractAbi = eth.contract(Betting);
	let myContract = contractAbi.at(contractAddress);
	
	web3.eth.sendTransaction({
		to: Contractaddress,
		from: Accountaddress,
		data: getData
	}, , function(err, txHash) {
		if (err != null) {
			console.error("Error while sending transaction: " + err);
		} else {
			console.log("Transaction Sent here's you  txHash: " + txHash);
		}
	});

	const transaction = {
		from: web3.eth.coinbase,
		to: receiverAddress,
		value: '0x00',
		gas: gasEstimate + 1,
		gasPrice: gasPrice + 1,
		data: setData
	}


	web3.eth.sendTransaction(transaction);

	//console.log(await contractInstance.methods.matchExists_f(2).call());
	//console.log(await contractInstance.methods.matches(0).call())
}

init();


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/src/frontend/main.html'));
});


app.get('/contractowner', (req, res) => {
	res.json(contractOwner);
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


	// TODO send betting info to contract
	// TODO add err checks for post


});




app.listen(port, () => {
	console.log(`listening on port ${port}...`);
});
