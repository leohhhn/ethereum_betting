pragma solidity ^0.8.0;

contract Betting {

    address public owner;
    uint public betDeadline; // svi mecevi imaju isti betting deadline

    event betPlaced(address better, uint bettingType, uint betValue, uint oddsForWinning);
    event payoutComplete(address[] winners);

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

    Match [] public matches;
    address [] public winners;

    mapping(uint16 => uint8) matchExists; // matchID => 0, 1
    mapping(address => uint8) public bettingAdmins;
    mapping(uint => Bet[]) public matchesPlacedBets; // matchID => Bet(address, typeofBet, betAmount)[]

    constructor () payable {
        // payable to have an initial amount on the house - needs to be able to payout a single winning bet
       	//require(msg.value == 1 ether, "initial amount should be 1 eth");
        owner = msg.sender;
        bettingAdmins[owner] = 1;
        betDeadline = block.timestamp + 7 days; // example deadline
    }

    modifier onlyAdmin(){
        require(bettingAdmins[msg.sender] == 1, "not an admin");
        _;
    }

    function makeMatch(uint16 matchID, uint8 tieQuote, uint8 teamAQuote, uint8 teamBQuote) public onlyAdmin {
        // testing function

        require(matchExists[matchID] == 0, "match already exists");
        matches.push(Match(matchID, tieQuote, teamAQuote, teamBQuote));

    }

    function placeBet(uint16 matchID, uint8 bettingType, uint16 oddsForWinning) external payable {
        // bettingType (0, 1, 2) - (Tie, TeamA, TeamB)

        // err checks
        require(msg.value >= 0, "invalid bet amount");
        require(bettingType == 0 || bettingType == 1 || bettingType == 2, "invalid betting type, supported values are 0, 1, 2");
        require(block.timestamp <= betDeadline, "bet deadline passed");
		require(matchExists[matchID] == 1, "Match does not exist");

        matchesPlacedBets[matchID].push(Bet(msg.sender, bettingType, msg.value, oddsForWinning));
        emit betPlaced(msg.sender, bettingType, msg.value, oddsForWinning);
    }

    function payWinningBets(uint16 matchID, uint8 winningType) external payable onlyAdmin {

        for(uint i = 0; i < matchesPlacedBets[matchID].length; i++){
            if(matchesPlacedBets[matchID][i].typeofBet == winningType) {

                winners.push(matchesPlacedBets[matchID][i].better);
                uint total = matchesPlacedBets[matchID][i].betAmount * matchesPlacedBets[matchID][i].oddsForWinning;
                // return rate = total * 0.95, 5% fee = 500 basis points
                // imprecise values appear when bet <= 10000, in this case wei. TODO impose min betAmount

                uint fee = total * 500 / 10000;
                payable(matchesPlacedBets[matchID][i].better).transfer(total - fee);
            }
        }

        emit payoutComplete(winners);
    }

    function addAdmin(address newAdminAddress) external onlyAdmin {
        bettingAdmins[newAdminAddress] = 1;
    }

    function deleteAdmin(address adminAddress) external onlyAdmin {
		delete bettingAdmins[adminAddress];
	}

}
