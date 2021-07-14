const express = require("express");
const app = express();
const path = require('path');
const matches = require('./src/backend/matches.json');
const fs = require('fs');
const port = process.env.PORT || 3000;

const Betting = require('./build/contracts/Betting.json');
const Web3 = require('web3');

let contractInstance;
let contractOwner;

let current_user_address;
app.use(express.urlencoded({
	extended: false
}));
app.use('/frontend', express.static(__dirname + '/src/frontend'));
app.use('/backend', express.static(__dirname + '/src/backend'));
app.use(express.static(path.join(__dirname, './build/contracts/')));

app.use(express.json());

// async function init() {
// 	const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:9545/");
// 	const id = await web3.eth.net.getId();
// 	const deployedNetwork = Betting.networks[id];
// 	contractInstance = new web3.eth.Contract(Betting.abi, deployedNetwork.address);
//
// 	if (typeof contractInstance !== 'undefined') {
// 		console.log("contract instance created successfully");
// 	} else {
// 		console.log("error");
// 	}
//
//
//
//  //contractOwner = await contractInstance.methods.owner().call();
//
// }
//
// init();


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/src/frontend/main.html'));
});


app.get('/getmatchesjson', (req, res) => {
	res.json(matches);
});



app.listen(port, () => {
	console.log(`listening on port ${port}...`);
});
