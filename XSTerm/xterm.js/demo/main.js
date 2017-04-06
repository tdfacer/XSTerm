var term,
    protocol,
    socketURL,
    socket,
    pid,
    charWidth,
    charHeight;

var terminalContainer = document.getElementById('terminal-container'),
    optionElements = {
        cursorBlink: true
    },
    colsElement = document.getElementById('cols'),
    rowsElement = document.getElementById('rows');


function setTerminalSize () {
  var cols = parseInt(colsElement.value),
      rows = parseInt(rowsElement.value),
      width = (cols * charWidth).toString() + 'px',
      height = (rows * charHeight).toString() + 'px';

  terminalContainer.style.width = width;
  terminalContainer.style.height = height;
  term.resize(cols, rows);
}

createTerminal();

function createTerminal() {
  // Clean terminal
  while (terminalContainer.children.length) {
    terminalContainer.removeChild(terminalContainer.children[0]);
  }
  term = new Terminal({
    cursorBlink: optionElements.cursorBlink.checked
  });
  term.on('resize', function (size) {

    if (!pid) {
      return;
    }
    var cols = size.cols,
        rows = size.rows,
        url = '/terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows;

    fetch(url, {method: 'POST'});
  });
  protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
  socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + '/terminals/';

  term.open(terminalContainer);
  window.addEventListener('resize', function() { term.fit() }, true);
  term.fit();

  var initialGeometry = term.proposeGeometry(),
      cols = initialGeometry.cols,
      rows = initialGeometry.rows;

  fetch('/terminals?cols=' + cols + '&rows=' + rows, {method: 'POST'}).then(function (res) {

    charWidth = Math.ceil(term.element.offsetWidth / cols);
    charHeight = Math.ceil(term.element.offsetHeight / rows);

    res.text().then(function (pid) {
      window.pid = pid;
      socketURL += pid;
      socket = new WebSocket(socketURL);
      socket.onopen = runTerminal;
    });
  });
}

function runTerminal() {
  term.attach(socket);
  term._initialized = true;
}

function clearTerminal() {
	term.send("\3");
	term.send("clear\r");
}

function runSomething (text, caseInsensitive, reg) {
	var command = "adb logcat";
if (text.length > 0){
	command += " | grep --color=auto ";
	if (caseInsensitive){
		command += "-i ";
	} else if (reg){
		command += "-E ";
	}
	command += "'" + text + "'";
}
	command += "\r";

	term.send("\3");
	term.send("clear\r");
	term.send(command);
}

function myFunction() {
	var w = document.getElementById("search").value;
	var x = document.getElementById("case").checked;
	var y = document.getElementById("regex").checked;

	runSomething(w, x, y);

}

document.getElementById('search').onkeydown = function(event) {
    if (event.keyCode == 13) {
        myFunction();
    }
}

function addToSearch (logtag) {
var tags = document.getElementById("logtags");
var selectedTag = tags.options[tags.selectedIndex].value;
	document.getElementById("regex").checked = true;
	//if (document.getElementById("search").value ==  null){
	if (document.getElementById("search").value.length == 0){
		document.getElementById("search").value = "\\(" + selectedTag + "\\)";
	} else {
		document.getElementById("search").value += "|\\(" + selectedTag + "\\)";
	}
	document.getElementById("search").placeholder = "";
}
