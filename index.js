var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');
var mainBox = document.getElementById('mainBox');
var blackBox = document.getElementById('blackBox');
var input = document.getElementById('input');
var submit = document.getElementById('submit');
var raftable = document.getElementById('rafvalues');
var affecttable = document.getElementById('affectvalues');
var subjectName = document.getElementById('subjectName');
var experimentNo = document.getElementById('experimentNo');
const httpMethodPost = 'POST';
const postHeaders = {
    'Accept': '*/*',
    'Content-Type': 'application/json'
};
const base_url = "https://wafer-backend.com:443";
//const base_url = "http://localhost:443";
var stompClient = null;
var firstTime = true
var dbDatas = [];
var trace = [];

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
        stompClient.subscribe('/engine-listen', function (message) {
            handleAutoSave(JSON.parse(message.body))
        });
    });
}

function handleAutoSave(message) {
    if (message.sender == "engine" && message.message == "save") {
        sendToServer();
    }
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
        "status" : message.status
    };
    drawGazer(message.xcord, message.ycord);
    dbDatas.push(dbData);
}


//test

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
//GDBB1901N

function download() {

    var CsvString = "TEST_SUBJECT_NAME" + "," +"EXPERIMENT_NO" + "DESCRIPTIONS,NEUTRAL,HAPPY,SAD,ANGRY,FEAR,SURPRISE,DISGUST,X_CORD,Y_CORD" + "\r \n";
    dbDatas.forEach(function (RowItem, RowIndex) {
        CsvString = CsvString + "\r" + RowItem.sender +","+ RowItem.model +","  + RowItem.neutral + ',' + RowItem.happy + ','
            + RowItem.sad + ',' + RowItem.angry + ','
            + RowItem.fear + ',' + RowItem.surprise + ','
            + RowItem.disgust + "," +  RowItem.xcord +" ," +RowItem.ycord  + "\r \n";
    });

    CsvString = "data:application/csv" + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", dbDatas[0].sender + " RESULTS.csv");
    document.body.appendChild(x);
    x.click();
}

function drawGazer(xcord, ycord) {
    var offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.style.position = "absolute";
    var offscreenC = offscreenCanvas.getContext('2d');
    blackBox.appendChild(offscreenCanvas);

    offscreenCanvas.width = blackBox.clientWidth;
    offscreenCanvas.height = blackBox.clientHeight;

    // in animate function, draw points onto the offscreen canvas instead
    // of the regular canvas as they are added
    var constant = (1920)
    if (trace.includes([xcord, ycord]) != true) {
        xcord = xcord / 1.95; 
        ycord = ycord / 1.95;
        trace.push([xcord, ycord]);
        var i = trace.length - 1;

        if (i > 1) {
            offscreenC.strokeStyle = 'red';
            offscreenC.beginPath();
            offscreenC.arc(xcord, ycord, 2, 0, 2 * Math.PI);
            offscreenC.moveTo(trace[i][0], trace[i][1])
            offscreenC.lineTo(trace[i - 1][0], trace[i - 1][1])
            offscreenC.stroke();
        }

        else if (i % 50 == 0) {
            offscreenC.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        }
    }

    offscreenC.drawImage(offscreenCanvas, 0, 0);


}