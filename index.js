var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');
var mainBox = document.getElementById('mainBox');
var input = document.getElementById('input');
var submit = document.getElementById('submit');
var raftable = document.getElementById('rafvalues');
var affecttable = document.getElementById('affectvalues');
var subjectName = document.getElementById('subjectName');
var experimentNo = document.getElementById('experimentNo');
const httpMethodPost = 'POST';
const postHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
var base_url = "http://64.225.94.117:8000";
var stompClient = null;
var firstTime = true
var dbDatas = [];

connect();

$(document).ready(function () {
    $('#rafTable').DataTable();
    $('#affectTable').DataTable();
    $('#grazerTable').DataTable();
});

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
        subjectName.innerText = "Test Subject Name: " + message.sender;
        experimentNo.innerText = "Experiment No: " + message.experimentCount;
        firstTime = false;
    }

    var data = [message.id, message.neutral, message.happy, message.sad, message.angry, message.fear, message.surprise, message.disgust]

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

    var dbData = {
        "id": message.id,
        "sender": message.sender,
        "experimentCount": message.experimentCount,
        "model": message.model,
        "neutral": message.neutral,
        "happy": message.happy,
        "sad": message.sad,
        "angry": message.angry,
        "fear": message.fear,
        "surprise": message.surprise,
        "disgust": message.disgust,
        "xcord": message.xcord,
        "ycord": message.ycord,
    }

    dbDatas.push(dbData);
}

async function sendToServer() {
    if (dbDatas.length != 0) {
        document.getElementById('loading').style.display = "inline-block";
        await fetch(base_url + '/save', {
            method: httpMethodPost,
            headers: postHeaders,
            body: JSON.stringify(dbDatas)
        }).catch(err => console.log(err))
            .finally(() => {
                document.getElementById('loading').style.display = "none";
            });
    }
}

function download() {
    var CsvString = "TEST_SUBJECT_NAME,EXPERIMENT_NO,DESCRIPTIONS,NEUTRAL,HAPPY,SAD,ANGRY,FEAR,SUPRISE,DISGUST,X_CORD,Y_CORD" + "\r\n";
    dbDatas.forEach(function (RowItem, RowIndex) {
        CsvString = CsvString + RowItem.neutral + ',' + RowItem.happy + ','
            + RowItem.sad + ',' + RowItem.angry + ','
            + RowItem.fear + ',' + RowItem.suprise + ','
            + RowItem.disgust + "\r\n";
    });
    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", dbDatas[0].sender + " RESULTS.csv");
    document.body.appendChild(x);
    x.click();
}