var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');
var mainBox = document.getElementById('mainBox');
var input = document.getElementById('input');
var submit = document.getElementById('submit');
var table = document.getElementById('table');
var blackBox = document.getElementById('blackBox');
var base_url = "http://localhost:3000";
var local_url = "http://192.168.1.106:3000";
var stompClient = null;
var firstTime = true

connect();

function connect() {
    var socket = new SockJS(base_url + '/prediction');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        stompClient.subscribe('/prediction-listen', function (message) {
            handleReceivedValue(JSON.parse(message.body))
        });
    });
}

function handleReceivedValue(message) {
    if (firstTime) {
        var subjectName = document.createElement('p').appendChild(document.createTextNode("Test Subject Name: " + message.sender));
        var experimentCount = document.createElement('p').appendChild(document.createTextNode("Experiment No: " + message.experimentCount));
        blackBox.appendChild(subjectName);
        blackBox.appendChild(experimentCount);
        firstTime = false;
    }

    var row = document.createElement('tr');

    var modelCell = document.createElement('td');
    var modelText = document.createTextNode(message.model);
    modelCell.appendChild(modelText);

    var neutralCell = document.createElement('td');
    var neutralText = document.createTextNode(message.neutral);
    neutralCell.appendChild(neutralText);

    var happyCell = document.createElement('td');
    var happyText = document.createTextNode(message.happy);
    happyCell.appendChild(happyText);

    var sadCell = document.createElement('td');
    var sadText = document.createTextNode(message.sad);
    sadCell.appendChild(sadText);

    var angryCell = document.createElement('td');
    var angryText = document.createTextNode(message.angry);
    angryCell.appendChild(angryText);

    var fearCell = document.createElement('td');
    var fearText = document.createTextNode(message.fear);
    fearCell.appendChild(fearText);

    var disgustCell = document.createElement('td');
    var disgustText = document.createTextNode(message.disgust);
    disgustCell.appendChild(disgustText);

    var surpriseCell = document.createElement('td');
    var surpriseText = document.createTextNode(message.surprise);
    surpriseCell.appendChild(surpriseText);

    var xcell = document.createElement('td');
    var xText = document.createTextNode(message.xcord);
    xcell.appendChild(xText);

    var ycell = document.createElement('td');
    var yText = document.createTextNode(message.ycord);
    ycell.appendChild(yText);

    row.appendChild(modelCell);
    row.appendChild(neutralCell);
    row.appendChild(happyCell);
    row.appendChild(sadCell);
    row.appendChild(angryCell);
    row.appendChild(fearCell);
    row.appendChild(disgustCell);
    row.appendChild(surpriseCell);
    row.appendChild(xcell);
    row.appendChild(ycell);

    table.appendChild(row);
}