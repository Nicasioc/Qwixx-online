/*
	2D6 White
	1D6 Red
	1D6 Yellow
	1D6 Green
	1D6 Blue
	6D6

	["red","yellow","blue","green"]
	whites are default

*/

function DiceRoller() {

	this.colors = ["red","yellow","blue","green"];

	this.log = [];

}

//color STRING
DiceRoller.prototype.removeColor = function(color) {
	var indexColor = this.colors.indexOf(color);
	this.colors.splice(indexColor,1);
}

DiceRoller.prototype.roll = function() {

	var diceRoll = function () {
		return Math.floor(Math.random()*6 + 1);
	}

	var colorRoll = function(whiteRoll1, whiteRoll2) {
		colorDice = {}
		colorDice.dice = diceRoll();
		colorDice.sum1 = colorDice.dice + whiteRoll1.dice;
		colorDice.sum2 = colorDice.dice + whiteRoll2.dice;
		return colorDice;
	}

	var roll = {};

	roll.white1 = {}
	roll.white1.dice = diceRoll();
	roll.white2 = {}
	roll.white2.dice = diceRoll();
	roll.white1.sum1 = roll.white2.dice + roll.white1.dice;
	roll.white2.sum1 = roll.white2.dice + roll.white1.dice;

	for (var i = 0; i <= this.colors.length-1; i++) {
		roll[ this.colors[i] ] = colorRoll(roll.white1, roll.white2);
	};

	this.log.push(roll);

	return roll;
};

module.exports = DiceRoller;