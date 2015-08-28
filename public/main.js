var connection = new Connection("ws://127.0.0.1:3000");

function disableRows(htmlCollection, startIndex, endIndex) {

	for (var i = startIndex; i < endIndex; i++) {
		if ( !htmlCollection[i].classList.contains("selected") ) {
			htmlCollection[i].classList.add("disable");
		}
	};
}

function selectRowNumber() {

	if ( !this.classList.contains("selected") && !this.classList.contains("disable") ) {

		var cellsNumbersLiveEl = this.parentNode.getElementsByClassName("cellNumber")

		var cellsNumbers = [].slice.call( cellsNumbersLiveEl );
		var clickedIndex = cellsNumbers.indexOf(this);

		cellsNumbersLiveEl.item(clickedIndex).classList.add("selected");
		cellsNumbersLiveEl.item(clickedIndex).innerHTML = "X";

		disableRows(cellsNumbersLiveEl, 0, clickedIndex);
	}
}

function selectPriceNumber() {
	var cellNumberElCol = this.parentNode.getElementsByClassName("cellNumber");
	if ( this.parentNode.getElementsByClassName("selected").length > 4 ) {
		this.classList.add("selected");
		this.innerHTML = "X"
		var msg = {
			type: "removeColor",
			text: this.parentNode.dataset.color
		}
		connection.send(msg);
		disableRows(cellNumberElCol, 0, cellNumberElCol.length)
	}
}

var numberCells = document.getElementsByClassName("cellNumber");

for (var i = 0 ; i < numberCells.length; i++) {
	numberCells[i].addEventListener("click", selectRowNumber);
}

var priceCells = document.getElementsByClassName("cellPrice");
for (var i = 0; i < priceCells.length; i++) {
	priceCells[i].addEventListener("click", selectPriceNumber);
};


/* click roll dice */
document.getElementById('rollDices').addEventListener("click", function() {
	var msg = {
		type: "roll",
		text: null
	}
	connection.send(msg);
})

connection.setOnmessage( function(event) {
	var msgJson = JSON.parse( event.data );

	switch (msgJson.type) {
		case "roll":
			var diceLogEl = document.getElementById("diceLog");
			var diceToAppend = "";
		    diceToAppend += '<div>'
		    for(var index in msgJson.text) {
		    	diceToAppend += '<div id="'+index+'" class="dice">'+msgJson.text[index].dice+'</div>'
		    }
		    diceToAppend += '</div>'
			diceLogEl.innerHTML += diceToAppend;
			break;
		case "closeRow":
			var rowColor = document.getElementById(msgJson.text+"Row");
			var rowColorCells = rowColor.getElementsByClassName("cell");
			console.log("cerrar "+msgJson.text);
			disableRows(rowColorCells, 0, rowColorCells.length);
			break;
	}

})