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

function runSomething (text, caseInsensitive, reg) {
//function runSomething (text) {
	//var command = "adb logcat | grep " + text + "\r";
	var command = "adb logcat";
if (text.length > 0){
	command += " | grep --color=auto ";
	if (caseInsensitive){
		command += "-i ";
	} else if (reg){
		command += "-E ";
	}
	command += "'" + text + "'";
 //| grep " + text + "\r";
} 	//if (reg) {
	//	command += "-E ";
	//} else if (case) {
	//	command += "-i ";
	//}

	//command += text + "\r";
	command += "\r";

	//var command = "adb logcat | grep " + text + "\r";
	//term.send("\3\r");
	term.send("\3");
	term.send("clear\r");
	term.send(command);
	//term.send ("ls\r");
	//term.send(something);
}

function myFunction() {
	//runSomething(document.getElementById("search").value);
	//document.getElementById("label1").innerHTML = document.getElementById("search").value;
	//document.getElementById("label2").innerHTML = document.getElementById("regex").checked;
	//document.getElementById("label3").innerHTML = document.getElementById("case").checked;


	var w = document.getElementById("search").value;
	var x = document.getElementById("case").checked;
	var y = document.getElementById("regex").checked;

	runSomething(w, x, y);
	//runSomething(w, true, false);

	if (x) {
		document.getElementById("label2").innerHTML = "pizza";
	}
	if (y) {
		document.getElementById("label3").innerHTML = "pasta";
	}


	//var text = document.getElementById("search").value;
	//var regex = document.getElementById("regex").checked;
	//var case = document.getElementById("case").checked;
	//runSomething(text, regex, case);
}
