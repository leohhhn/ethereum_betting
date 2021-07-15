// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract Betting {

    address public owner;
    uint public betDeadline; // svi mecevi imaju isti betting deadline

    event betPlaced(address better, uint bettingType, uint betValue, uint oddsForWinning);
    event payoutComplete(Winner winner);

    struct Match {
        uint16 matchID;
        uint8 tieQuote;
        uint8 teamAQuote;
        uint8 teamBQuote;
    }

    struct Bet {
        address better;
        uint8 typeofBet;
        uint256 betAmount;
        uint16 oddsForWinning;
    }

	struct Winner{
		address better;
		uint256 wonAmount;
	}

    mapping(uint16 => uint8) matchExists; // matchID => 0, 1 // maybe not needed bcs of matchMapping
    mapping(uint16 => uint8) matchPayedOut; // matchID => 0, 1
	mapping(uint => Bet[]) matchesPlacedBets; // matchID => Bet(struct attributes)[]
	mapping(uint16 => Match) public matchMapping; // matchID, Match(struct attributes)
    mapping(address => uint8) public bettingAdmins;

    constructor () payable {
        // payable to have an initial amount on the house - needs to be able to payout a single winning bet
       	require(msg.value > 0, "there needs to be a deposit");
        owner = msg.sender;
        bettingAdmins[owner] = 1;
        betDeadline = block.timestamp + 64 days; // example deadline
		makeMatches();
    }

    modifier onlyAdmin(){
        require(bettingAdmins[msg.sender] == 1, "not an admin");
        _;
    }

	function makeMatches() internal {
		// create matches with same attributes as in JSON
		// TODO make this not hard-coded
		makeMatch(0, 3, 2, 3);
		makeMatch(1, 2, 9, 2);
		makeMatch(2, 2, 3, 5);
		makeMatch(3, 2, 3, 5);
		makeMatch(4, 2, 3, 5);
		makeMatch(5, 2, 3, 5);
	}

	function makeMatch(uint16 matchID, uint8 tieQuote, uint8 teamAQuote, uint8 teamBQuote) public onlyAdmin {
  	  require(matchExists[matchID] == 0, "match already exists");
  	  matchExists[matchID] = 1;
	  matchMapping[matchID] = Match(matchID, tieQuote, teamAQuote, teamBQuote);
    }

    function placeBet(uint16 matchID, uint8 bettingType, uint16 oddsForWinning) external payable {
        // bettingType (0, 1, 2) - (Tie, TeamA, TeamB)

        // err checks
        require(msg.value > 0, "invalid bet amount");
        require(bettingType == 0 || bettingType == 1 || bettingType == 2, "invalid betting type, supported values are 0, 1, 2");
        require(block.timestamp <= betDeadline, "bet deadline passed");
		require(matchExists[matchID] == 1, "Match does not exist");

		bool falsified = false;
		if(bettingType == 0 && oddsForWinning != matchMapping[matchID].tieQuote) {
			falsified = true;
		} else if (bettingType == 1 && oddsForWinning != matchMapping[matchID].teamAQuote) {
			falsified = true;
		}
		else if (bettingType == 2 && oddsForWinning != matchMapping[matchID].teamBQuote) {
			falsified = true;
		} // simple check if user falsified bet info

		require(falsified == false, "user has falsified odds");

        matchesPlacedBets[matchID].push(Bet(msg.sender, bettingType, msg.value, oddsForWinning));
        emit betPlaced(msg.sender, bettingType, msg.value, oddsForWinning);
    }

    function payWinningBets(uint16 matchID, uint8 winningType) external payable onlyAdmin {

        require(matchPayedOut[matchID] == 0, "match already payed out");
    //    Winner [] memory winners;
        for(uint i = 0; i < matchesPlacedBets[matchID].length; i++){
            if(matchesPlacedBets[matchID][i].typeofBet == winningType) {

                uint total = matchesPlacedBets[matchID][i].betAmount * matchesPlacedBets[matchID][i].oddsForWinning;
                // return rate = total * 0.95, 5% fee = 500 basis points
                // imprecise values appear when bet <= 10000, in this case wei. TODO impose min betAmount

                uint fee = (total * 500) / 10000;
				// winners [] too expensive?
			//	winners[i] = Winner(matchesPlacedBets[matchID][i].better, (total - fee));

                payable(matchesPlacedBets[matchID][i].better).transfer(total - fee);
                emit payoutComplete(Winner(matchesPlacedBets[matchID][i].better, (total - fee)));
            }
            // todo check if contract balance bit enough to payout everyone
        }
        matchPayedOut[matchID] = 1;
    }

    /* function addAdmin(address newAdminAddress) external onlyAdmin {
        bettingAdmins[newAdminAddress] = 1;
    }

    function deleteAdmin(address adminAddress) external onlyAdmin {
		delete bettingAdmins[adminAddress];
	} */

	function matchExists_f(uint16 matchID) view external onlyAdmin returns(bool) {
		if(matchMapping[matchID].matchID == matchID)
			return true;
		return false;
	}

	function getContractBalance() view public returns (uint256) {
        return address(this).balance;
    }


}
