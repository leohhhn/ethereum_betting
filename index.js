const express = require("express");
const app = express();
const path = require('path');
const matches = require('./src/backend/matches.json');
const fs = require('fs');
const port = process.env.PORT || 3000;

const Betting = require('./build/contracts/Betting.json');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

let current_user_address;

app.use(express.urlencoded({ extended : false }));
app.use('/frontend', express.static(__dirname + '/src/frontend'));
app.use('/backend', express.static(__dirname + '/src/backend'));


async function init() {
	current_user_address = web3.eth.accounts[0];
	//	const provider = await new HDWalletProvider();
}

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/src/frontend/main.html'));
});

app.get('/getmatchesjson', (req, res) => {
	res.json(matches);
});

app.post('/sendBet', (req, res) => {
	// TODO send betting info to contract

});

app.get('/', (req, res) => {
	init();
});

app.listen(port, () => {
	console.log(`listening on port ${port}...`);
});
