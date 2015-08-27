/*
	2D6 White
	1D6 Red
	1D6 Yellow
	1D6 Green
	1D6 Blue
	6D6

	["r","y","g","b"]
	whites are default

http://www.nsv.de/spielregeln/qwixx-classic-english.pdf

*/

function qwixxRoll(_diceColorsToRoll) {

	var diceColorsToRoll = _diceColorsToRoll;

	var diceRoll = function () {
		return Math.floor(Math.random()*6 + 1);
	}

	var colorRoll = function(whiteRolls) {
		colorDice = {}
		colorDice.dice = diceRoll();
		colorDice.sum1 = colorDice.dice + whiteRolls.dice1;
		colorDice.sum2 = colorDice.dice + whiteRolls.dice2;
		return colorDice;
	}

	var roll = {};

	roll.white = {}
	roll.white.dice1 = diceRoll();
	roll.white.dice2 = diceRoll();
	roll.white.sum = roll.white.dice1 + roll.white.dice2;

	for (var i = 0; i <= diceColorsToRoll.length-1; i++) {
		roll[ diceColorsToRoll[i] ] = colorRoll(roll.white);
	};

	return roll;
}

function selectRowNumber() {

	if ( !this.classList.contains("selected") && !this.classList.contains("disable") ) {

		var cellsNumbersLiveEl = this.parentNode.getElementsByClassName("cellNumber")

		var cellsNumbers = [].slice.call( cellsNumbersLiveEl );
		var clickedIndex = cellsNumbers.indexOf(this);

		cellsNumbersLiveEl.item(clickedIndex).classList.add("selected");
		cellsNumbersLiveEl.item(clickedIndex).innerHTML = "X";

		for (var i = clickedIndex; i >= 0 ; i--) {
			if( !cellsNumbersLiveEl[i].classList.contains("selected") ) {
				cellsNumbersLiveEl[i].classList.add("disable");
			}
		};
	}
}

function selectPriceNumber() {
	var cellNumberElCol = this.parentNode.getElementsByClassName("cellNumber");
	if ( this.parentNode.getElementsByClassName("selected").length > 4 ) {
		this.classList.add("selected");
		this.innerHTML = "X"
		for (var i = 0; i < cellNumberElCol.length; i++) {
			if ( !cellNumberElCol[i].classList.contains("selected") ) {
				cellNumberElCol[i].classList.add("disable");
			}
		};
	}
}

/*
 * DOM
 */

var dicesChk = document.getElementsByClassName("diceColor");
/* click roll dice */
document.getElementById('rollDices').addEventListener("click", function() {
	var dicesColorToRoll = [];
	for (var i = 0; i <= dicesChk.length-1; i++) {
		if ( dicesChk[i].checked ) {
			dicesColorToRoll.push(dicesChk[i].value);
		}
	};
	console.debug( qwixxRoll(dicesColorToRoll) );
	dicesColorToRoll = [];
})

var numberCells = document.getElementsByClassName("cellNumber");

for (var i = 0 ; i < numberCells.length; i++) {
	numberCells[i].addEventListener("click", selectRowNumber);
}

var priceCells = document.getElementsByClassName("cellPrice");
for (var i = 0; i < priceCells.length; i++) {
	priceCells[i].addEventListener("click", selectPriceNumber);
};

var connection = new WebSocket("ws://127.0.0.1:3000");

connection.onopen = function(message) {
	console.debug(message);
}