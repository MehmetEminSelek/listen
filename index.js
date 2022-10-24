var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');
var mainBox = document.getElementById('mainBox');
var input = document.getElementById('input');
var submit = document.getElementById('submit');
var raftable = document.getElementById('rafvalues');
var affecttable = document.getElementById('affectvalues');
var subjectName = document.getElementById('subjectName');
var experimentNo = document.getElementById('experimentNo');
var base_url = "http://localhost:3000";
var local_url = "http://192.168.1.106:3000";
var stompClient = null;
var firstTime = true

connect();

$(document).ready(function () {
    $('#rafTable').DataTable();
    $('#affectTable').DataTable();
    $('#grazerTable').DataTable();
});

function connect() {
    var socket = new SockJS(local_url + '/prediction');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        stompClient.subscribe('/prediction-listen', function (message) {
            handleReceivedValue(JSON.parse(message.body))
        });
    });
}

function handleReceivedValue(message) {
    if (firstTime) {
        subjectName.innerText = "Test Subject Name: " + message.sender;
        experimentNo.innerText = "Experiment No: " + message.experimentCount;
        firstTime = false;
    }

    var data = [message.id, message.neutral, message.happy, message.sad, message.angry, message.fear, message.surprise, message.disgust, message.status]
    var grazerData = [message.id, message.xcord, message.ycord]

    if (message.model == "Raf") {
        $('#rafTable').DataTable().row.add(data).draw();
    } else if (message.model == "Affectnet") {
        $('#affectTable').DataTable().row.add(data).draw();
    }

    if ($('#grazerTable').DataTable().data().length == 0) {
        $('#grazerTable').DataTable().row.add(grazerData).draw();
    }

    if ($('#grazerTable').DataTable().data().length >= 1) {
        if ($('#grazerTable').DataTable().data()[$('#grazerTable').DataTable().data().length - 1][0] != grazerData[0]) {
            $('#grazerTable').DataTable().row.add(grazerData).draw();
        }
    }
}