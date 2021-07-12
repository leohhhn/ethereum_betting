console.log("client side js running");

let matches;
const btnGetMatches = document.getElementById('btnGetMatches');
const connectMMButton = document.getElementById("btnConnectMM");
const accountParag = document.getElementById("accountParag");

let flag = 0; // already loaded data from json into table - wont change as it is static (for now)
let accounts;

// metamask integration

connectMMButton.addEventListener('click', (e) => {

	if (typeof window.ethereum !== 'undefined') {
		//	console.log("metamask is installed");
		getAccounts();
		connectMMButton.disabled = true;
	} else {
		alert("Please install MetaMask to use this app.");
	}
});

async function getAccounts() {
	accounts = await ethereum.request({
		method: 'eth_requestAccounts'
	});
	let curr_acc = accounts[0];
	accountParag.innerHTML = "Account: " + curr_acc;
	connectMMButton.classList.add('btn-success');
	connectMMButton.innerHTML = "Connected to Metamask!";
}

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
		console.log("addEventListener for " + buttonIDs[i]);
		$(document).on('click', '#' + buttonIDs[i], function() {

					let curr_acc = accounts[0];
					let betAmount = document.getElementById(`betAmount${i+1}`).value;
					let radioButtons = document.getElementsByName(`selectBetType${i+1}`);
					let typeOfBet = -1; // typeOfBet (0, 1, 2) - (Tie, TeamA, TeamB)

					for (let j = 0; j < radioButtons.length; j++) {
						if (radioButtons[j].checked)
							typeOfBet = j;
					}
					if (betAmount <= 0 || typeof betAmount === 'undefined') {
						//	TODO check if empty <input> returns undefined or just ''
						alert('Must place bet amount');
						return;
					} else if (typeof accounts[0] === 'undefined') {
						alert('Error with current account, check MetaMask');
						return;
					} else if (typeOfBet == -1) {
						alert('What are you betting on?');
						return;
					} else {
						console.log("Successful bet!", {betAmount: betAmount, typeOfBet: typeOfBet, Account: accounts[0]});
					}
				}
			);
		}

}

window.ethereum.on('accountsChanged', function(accounts) {
	accountParag.innerHTML = "Account: " + accounts[0];
});

// build matches table

function buildTable(matchObj) {
	let table = document.getElementById('matchTable');
	let matches = matchObj.matches; // array of matches
	let dynButtonIDs = [];

	if (flag == 0) {
		for (let i = 0; i < matches.length; i++) {
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
				<td><input type="radio" id="betTie${i+1}" name="selectBetType${i+1}"></input></td>
				<td><input type="radio" id="betTeamA${i+1}" name="selectBetType${i+1}"></input></td>
				<td><input type="radio" id="betTeamB${i+1}" name="selectBetType${i+1}"></input></td>
				<td><input type="number" id="betAmount${i+1}"></input></td>
				<td><button type="button" id="btnGetMatches${i+1}" class="btn btn-primary">Place bet!</button></td>
			</tr>
		  `;
			table.innerHTML += row;

			dynButtonIDs[i] = `btnGetMatches${i+1}`; // 0th button has id 1
		}
		flag = 1;
		//console.log(dynButtonIDs);
		addDynEventListeners(dynButtonIDs);

	}
}
