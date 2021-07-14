let matches;
let jsonIsLoaded = 0; // already loaded data from json into table - wont change as it is static (for now)
let accounts;
let current_account;
let isOwner = false;
let mmConnected = 0;
let dynButtonIDs = [];
let adminDashboard;
let contractArtifact;
let abi;
let contractAddress;
let contractInstance;
let web3;

const btnGetMatches = document.getElementById('btnGetMatches');
const connectMMButton = document.getElementById("btnConnectMM");
const accountParag = document.getElementById("accountParag");

// metamask integration

connectMMButton.addEventListener('click', (e) => {
	if (typeof window.ethereum !== 'undefined') {
		//	console.log("metamask is installed");
		getAccounts();
		connectMMButton.disabled = true;
		mmConnected = 1;
	} else {
		alert("Please install MetaMask to use this app.");
		return;
	}

	fetch('/Betting.json')
		.then(
			res => {
				return res.text();
			})
		.then(json => {
			contractArtifact = JSON.parse(json);
			abi = contractArtifact.abi;
			let deployments = Object.keys(contractArtifact.networks);
			contractAddress = contractArtifact.networks[deployments[deployments.length - 1]];
			init();
		}).catch(e => console.log(e));

});

async function init() {
	web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:9545/");
	contractInstance = new web3.eth.Contract(abi, contractAddress.address);

	if (typeof contractInstance !== 'undefined') {
		console.log("contract instance created successfully");
	} else {
		console.log("error: contract instance undefined");
	}

	getOwner();
}


async function getAccounts() {
	accounts = await ethereum.request({
		method: 'eth_requestAccounts'
	});
	current_account = accounts[0];
	accountParag.innerHTML = "Account: " + current_account;
	connectMMButton.classList.add('btn-success');
	connectMMButton.innerHTML = "Connected to Metamask!";
}

async function getOwner() {
	contractOwner = await contractInstance.methods.owner().call();
	if (contractOwner.toLowerCase() === current_account) {
		console.log("youre the owner!!");
		isOwner = true;
		//enable admin dashboard
		adminDashboard = document.getElementById('adminDashboard').style.display = '';
	} else {
		isOwner = false; // if changed accounts reset bool
		adminDashboard = document.getElementById('adminDashboard').style.display = 'none';
	}

}

window.ethereum.on('accountsChanged', function(accounts) {
	current_account = accounts[0];
	accountParag.innerHTML = "Account: " + current_account;
	getOwner();
});

// event listeners

btnGetMatches.addEventListener('click', (e) => {
	fetch('/getmatchesjson', {
			method: 'GET'
		})
		.then(res => {
			if (res.ok)
				return res.json();
			else
				console.log("error with fetch");
		})
		.then(matches => {
			buildTable(matches)
		})
		.catch((e) => console.log(e));
});

function addDynEventListeners(buttonIDs) {
	// IDs in html start from 1

	for (let i = 0; i < buttonIDs.length; i++) {
		$(document).on('click', '#' + buttonIDs[i], function() {

			if (typeof accounts === 'undefined') {
				alert("MetaMask not connected or has error");
				return;
			}

			let betAmount = document.getElementById(`betAmount${i}`).value;
			let radioButtons = document.getElementsByName(`selectBetType${i}`);
			let typeOfBet = -1; // typeOfBet (0, 1, 2) - (Tie, TeamA, TeamB)
			let matchID = i;


			for (let j = 0; j < radioButtons.length; j++) {
				if (radioButtons[j].checked)
					typeOfBet = j;
			}

			if (betAmount < 10000 || betAmount == '') {
				//	TODO check if empty <input> returns undefined or just ''
				alert('Minimum bet amount is 10k wei');
				return;
			} else if (typeOfBet == -1) {
				alert('What are you betting on?');
				return;
			} else {

				let oddsForWinning;
				switch (typeOfBet) {
					case 0:
						oddsForWinning = matches[i].Tie;
						break;
					case 1:
						oddsForWinning = matches[i].Team_A_Win;
						break;
					case 2:
						oddsForWinning = matches[i].Tie;
						break;
				}

				placeABet(i, typeOfBet, oddsForWinning, betAmount);

				// TODO disable already clicked bet button and reset
				console.log({i, typeOfBet, oddsForWinning, betAmount});
			}
		});
	}
}

async function placeABet(matchID, typeOfBet, oddsForWinning, betAmount) {

	if (typeof contractInstance !== 'undefined') {
		console.log("contract instance created successfully");
	} else {
		console.log("can't reach contract instance");
	}

	let res = await contractInstance.methods.placeBet(matchID, typeOfBet, oddsForWinning).send({
		from: current_account,
		value: betAmount.toString()
	}).catch(e => {return e;});

	console.log(res);

}

// build matches table

function buildTable(matchObj) {
	let table = document.getElementById('matchTable');
	matches = matchObj.matches; // array of matches

	if (jsonIsLoaded == 0) {
		for (let i = 0; i < matches.length; i++) {
			// fix ffs
			let row = `
			<tr>
				<td>${matches[i].matchID}</td>
				<td>${matches[i].competition}</td>
				<td>${matches[i].teamA}</td>
				<td>${matches[i].teamB}</td>
				<td>${matches[i].Tie}</td>
				<td>${matches[i].Team_A_Win}</td>
				<td>${matches[i].Team_B_Win}</td>
				<td>${matches[i].gameday}</td>
				<td><input type="radio" id="betTie${i}" name="selectBetType${i}"></input></td>
				<td><input type="radio" id="betTeamA${i}" name="selectBetType${i}"></input></td>
				<td><input type="radio" id="betTeamB${i}" name="selectBetType${i}"></input></td>
				<td><input type="number" id="betAmount${i}"></input></td>
				<td><button type="button" id="btnGetMatches${i}" class="btn btn-primary">Place bet!</button></td>
			</tr>
		  `;
			table.innerHTML += row;
			dynButtonIDs[i] = `btnGetMatches${i}`; // 0th button has id 1
		}
		jsonIsLoaded = 1;
		//console.log(dynButtonIDs);
		addDynEventListeners(dynButtonIDs);

	}
}
