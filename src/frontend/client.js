let matches;
let jsonIsLoaded = 0; // already loaded data from json into table - wont change as it is static (for now)
let accounts;
let current_account;
let isOwner = false;
let mmConnected = false;
let dynButtonIDs = [];
let adminDashboard;
let contractArtifact;
let abi;
//let contractAddress = '0xfDDC1cCf90C3973D1d1DFb032BB7C0b4C9009d87'; // deploy address on ropsten
let contractAddress;
let contractInstance;
let contractOwner;
let gotOwner = false;
let web3;


const btnGetMatches = document.getElementById('btnGetMatches');
const btnConnectMM = document.getElementById("btnConnectMM");
const accountParag = document.getElementById("accountParag");
//const btnAddAdmin = document.getElementById("btnAddAdmin"); // TODO add later
const btnPayoutBets = document.getElementById("btnPayoutBets");


// metamask integration & eth-related functions

btnConnectMM.addEventListener('click', (e) => {
	if (typeof window.ethereum !== 'undefined') {
		getAccounts().catch(e => console.log(e)); //
		// TODO fix thrown error when metamask is not on the correct network
		btnConnectMM.disabled = true;
		mmConnected = true;
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
			contractAddress = contractAddress.address;
			init();
		}).catch(e => console.log(e));

	// TODO add cookies?

});

async function init() {
	// initialize web3 and contract instance
	web3 = new Web3(Web3.givenProvider || "https://ropsten.infura.io/v3/4d93ddd7ecf446f4956be00a0fda13c9");
	// contract deployed to ropsten address
	contractInstance = new web3.eth.Contract(abi, contractAddress);
	if (typeof contractInstance !== 'undefined') {
		console.log("contract instance created successfully");
	} else {
		console.log("error: contract instance undefined");
	}


	getOwner();
}

async function getAccounts() {
	// load in accounts from metamask
	accounts = await ethereum.request({
		method: 'eth_requestAccounts'
	});
	current_account = accounts[0];
	accountParag.innerHTML = "Account: " + current_account;
	btnConnectMM.classList.add('btn-success');
	btnConnectMM.innerHTML = "Connected to Metamask!";
}

async function getOwner() {
	// get owner of owner and display admin dashboard
	if (gotOwner === false) {
		contractOwner = await contractInstance.methods.owner().call();
		gotOwner = true;
	}

	if (contractOwner.toLowerCase() === current_account.toLowerCase()) {
		//console.log("youre the owner!!");
		isOwner = true;
		//enable admin dashboard
		adminDashboard = document.getElementById('adminDashboard').style.display = '';
	} else {
		isOwner = false; // the current address is not the owner
		adminDashboard = document.getElementById('adminDashboard').style.display = 'none';
	}
}

async function payoutWinners(matchID, winningType) {

	if (isOwner) {
		let res = await contractInstance.methods.payWinningBets(
			(matchID - 1).toString(), winningType.toString()).send({
			from: current_account
		});
		console.log(res);
	}
}

window.ethereum.on('accountsChanged', function(accounts) {
	// when metamask account changes
	current_account = accounts[0];
	accountParag.innerHTML = "Account: " + current_account;
	getOwner();
});

// event listeners

btnGetMatches.addEventListener('click', e => {
	// get matches json from server
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

btnPayoutBets.addEventListener('click', e => {

	let winningType = document.getElementById('inputWinningType').value;
	let mID = document.getElementById('inputMatchID').value;

	// // err checks
	// if (winningType !== 0 || winningType !== 1 || winningType !== 2) {
	// 	console.log("invalid input type", winningType, typeof winningType);
	// 	return;
	// } else if (mID < 0 || mID > matches.length - 1) {
	// 	console.log(mID + " is invalid, min 0 max " + matches.length - 1);
	// 	return;
	// }

	payoutWinners(mID, winningType);
});

function addDynEventListeners(buttonIDs) {
	// add event listeners for dynamically created buttons

	for (let i = 0; i < buttonIDs.length; i++) {
		$(document).on('click', '#' + buttonIDs[i], function() {

			if (typeof accounts === 'undefined') {
				alert("MetaMask not connected or has error");
				return;
			}
			let betInput = document.getElementById(`betAmount${i}`);
			let betAmount = betInput.value;
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
				radioButtons[typeOfBet].checked = false;
				betInput.value = '';

				console.log({
					i,
					typeOfBet,
					oddsForWinning,
					betAmount
				});


			}
		});
	}
}

async function placeABet(matchID, typeOfBet, oddsForWinning, betAmount) {

	if (typeof contractInstance !== 'undefined') {
		// another check, just in case
		console.log("contract is instantiated");
	} else {
		console.log("can't reach contract instance");
	}

	let res = await contractInstance.methods.placeBet(matchID.toString(), typeOfBet.toString(), oddsForWinning.toString()).send({
		from: current_account,
		value: betAmount.toString()
	}).catch(e => {
		return e
	});

	console.log(res);
	//console.log(await contractInstance.methods.balance().call());

}

// build matches table
let str = '';
function buildTable(matchObj) {
	let table = document.getElementById('matchTable');
	matches = matchObj.matches; // array of matches

	if (jsonIsLoaded == 0) {
		for (let i = 0; i < matches.length; i++) {
			let row = `
			<tr>
				<td>${i+1}</td>
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
		addDynEventListeners(dynButtonIDs);
	}
}
