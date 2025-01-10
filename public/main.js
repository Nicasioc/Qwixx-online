/* global Connection */
//http://www.nsv.de/spielregeln/qwixx-classic-english.pdf

var connection = new Connection("ws://127.0.0.1:3000");

function message(type, text) {
  if (type) {
    var msg = {
      type: type,
      text: text || null,
    };
    return msg;
  } else {
    console.error("Text message must be defined");
  }
}

/* Lobby */
document.getElementById("playerReady").addEventListener("click", function (e) {
  var btn = this.parentNode;
  btn.classList.toggle("ready");
  if (btn.classList.contains("ready")) {
    connection.send(message("isReady", true));
  } else {
    connection.send(message("isReady", false));
  }
});
document.getElementById("startGame").addEventListener("click", function (e) {
  connection.send(message("startCountDown"));
});

/* Board */
function disableRows(htmlCollection, startIndex, endIndex) {
  for (var i = startIndex; i < endIndex; i++) {
    if (!htmlCollection[i].classList.contains("selected")) {
      htmlCollection[i].classList.add("disable");
    }
  }
}

function selectRowNumber() {
  if (
    !this.classList.contains("selected") &&
    !this.classList.contains("disable")
  ) {
    var cellsNumbersLiveEl =
      this.parentNode.getElementsByClassName("cellNumber");

    var cellsNumbers = [].slice.call(cellsNumbersLiveEl);
    var clickedIndex = cellsNumbers.indexOf(this);

    cellsNumbersLiveEl.item(clickedIndex).classList.add("selected");
    cellsNumbersLiveEl.item(clickedIndex).innerHTML = "X";

    disableRows(cellsNumbersLiveEl, 0, clickedIndex);
  }
}

function selectPriceNumber() {
  var cellNumberElCol = this.parentNode.getElementsByClassName("cellNumber");
  if (this.parentNode.getElementsByClassName("selected").length > 4) {
    this.classList.add("selected");
    this.innerHTML = "X";

    connection.send(message("removeColor", this.parentNode.dataset.color));

    disableRows(cellNumberElCol, 0, cellNumberElCol.length);
  }
}

var numberCells = document.getElementsByClassName("cellNumber");

for (var i = 0; i < numberCells.length; i++) {
  numberCells[i].addEventListener("click", selectRowNumber);
}

var priceCells = document.getElementsByClassName("cellPrice");
for (var i = 0; i < priceCells.length; i++) {
  priceCells[i].addEventListener("click", selectPriceNumber);
}

/* click roll dice */
document.getElementById("rollDices").addEventListener("click", function () {
  connection.send(message("roll"));
});

connection.setOnmessage(function (event) {
  console.debug(msgJson.type);

  const msgJson =
    event && typeof event.data === "string" ? JSON.parse(event.data) : "";

  switch (msgJson.type) {
    case "roll": {
      var diceLogEl = document.getElementById("diceLog");
      var diceToAppend = "";
      diceToAppend += "<div>";
      for (var index in msgJson.text) {
        diceToAppend +=
          '<div id="' +
          index +
          '" class="dice">' +
          msgJson.text[index].dice +
          "</div>";
      }
      diceToAppend += "</div>";
      diceLogEl.innerHTML += diceToAppend;
      break;
    }
    case "closeRow": {
      var rowColor = document.getElementById(msgJson.text + "Row");
      var rowColorCells = rowColor.getElementsByClassName("cell");
      console.log("cerrar " + msgJson.text);
      disableRows(rowColorCells, 0, rowColorCells.length);
      break;
    }
    case "playersReady": {
      console.log(msgJson.text);
      document.getElementById("playerCounterNumber").innerHTML = msgJson.text;

      if (msgJson.text >= 2) {
        document.getElementById("startGame").classList.remove("hidden");
      } else {
        document.getElementById("startGame").classList.add("hidden");
      }
      break;
    }
    case "startGame": {
      document.getElementById("game").classList.remove("hidden");
      document.getElementById("lobby").classList.add("hidden");
      break;
    }
    case "playerId": {
      console.debug(msgJson.text);
      localStorage.setItem("playerId", msgJson.text);
      break;
    }
  }
});

window.onbeforeunload = function () {
  return "Bye";
};
