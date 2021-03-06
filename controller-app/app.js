//var BlendMicro = require("#{__dirname}/../../");
const BlendMicro = require("blendmicro");
const noble = require('noble');
const sleep = require('sleep');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').load();

var MongoClient = require('mongodb').MongoClient;
let dbConnected = false;
let db = null;
const app = express();
app.use("/public", express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.get('/data', function(req, res) {
    res.send(JSON.stringify({ payload: [...command.slice(7, 7 + 54)] }))
});

app.post('/data', function(req, res) {
    var data = req.body;
    console.log("/data recv");
    console.log(data);
    if (!data.payload || !data.payload.length == 54) {
        res.send("error");
    } else if (!connected) {
        res.send("no connection");
    } else {
        sendCommand(data.payload);
        res.send("ok");
    }
});

app.get('/setting/:id', function(req, res) {
    let id = req.params.id;
    console.log("find " + id);
    if (dbConnected) {
        db.collection('settings').findOne({ "id": id }, function(err, item) {
            if (err) {
                res.send("Error: " + err);
            } else {
                if (item) {
                    res.send(JSON.stringify(item));
                } else {
                    res.send(JSON.stringify({ "id": id, "value": new Array(54).fill(0) }));
                }

            }
        });
    } else {
        res.send("Error: DB not connected.");
    }
});

app.get('/setting', function(req, res) {
    if (dbConnected) {
        db.collection('settings').find().toArray(function(err, items) {
            if (err) {
                res.send("Error: " + err);
            } else {
                res.send(JSON.stringify(items));
            }
        });
    } else {
        res.send("Error: DB not connected.");
    }
});

app.post('/setting/:id', function(req, res) {
    let id = req.params.id;
    if (dbConnected) {
        db.collection('settings').findOne({ "id": id }, function(err, item) {
            if (err) {
                res.send("Error: " + err);
            } else {
                sendCommand(item.value);
                res.send("ok");
            }
        });

    } else {
        res.send("Error: db not connected");
    }
});

app.get('/show/:id', function(req, res) {
    let id = req.params.id;
    if (dbConnected) {
        db.collection('settings').replaceOne({ "id": id }, req.body, { upsert: true });
        res.send("ok");
    } else {
        res.send("Error: db not connected");
    }
});

app.post('/setting/', function(req, res) {
    if (dbConnected && req.body && req.body.length > 0) {
        //db.collection('settings').update({}, req.body, { upsert: true });
        req.body.forEach(function(item) {
            console.log(item);
            db.collection('settings').replaceOne({ "id": item.id }, item, { upsert: true });
        });
        res.send("ok");
    } else {
        res.send("Error: db not connected");
    }
});


app.get('/', function(req, res) {
    res.sendFile("index.html", { root: path.join(__dirname, '/public') });
});

app.listen(process.env.PORT, function() {
    console.log('Example app listening on port ' + process.env.PORT + '!');
});

// Connect to the db
MongoClient.connect(process.env.DBCONN, function(err, _db) {
    if (!err) {
        console.log("Mongodb Connected");
        dbConnected = true;
        db = _db;
    } else {
        console.dir(err);
    }
});

/*
noble.on('discover', (e) => {
    console.log("app:found: " + e.advertisement.localName);
});
*/
sleep.msleep(100);
var bm = null;
//noble.on('stateChange', (e) => {
//console.log("app:noble stateChanged: " + e);
//var bm = new BlendMicro(process.argv[2]);
bm = new BlendMicro(process.env.BTNAME);
bm.on("open", function() {
    console.log("open");
    connected = true;
    sleep.msleep(100);
    bm.write(initDevice);
    console.log("initial command");
    sleep.msleep(100);
    sendCommand(new Array(54));
});

bm.on("data", function(data) {
    console.log(data.toString('hex'));
});
//});

const startDataIndex = 7;
let connected = false;
let bytesToSend = 0;
let initDevice = new Buffer([0xfa, 0x01, 0x00, 0x03, 0x01, 0x00, 0x08, 0x09, 0x55, 0xa9]);
/*
commands.push(new Buffer([0xfa, 0x03, 0x00, 0x39, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xc0, 0x00, 0xc0, 0x30, 0x00, 0xf0]));
commands.push(new Buffer([0xc0, 0x03, 0xc0, 0xf0, 0x00, 0xf0, 0xc3, 0xc3, 0xc0, 0xf0, 0x0f, 0xff, 0xcf, 0x33, 0xc0, 0xf0, 0x3c, 0xf0, 0xcf, 0xf3]));
commands.push(new Buffer([0xc0, 0xf0, 0x3c, 0xf0, 0xcf, 0x03, 0xc0, 0xf0, 0x3c, 0xf0, 0xc3, 0xc3, 0xf0, 0xfc, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x07, 0x55, 0xa9]));
*/

// All Off
/*
commands.push(new Buffer([0xfa, 0x03, 0x00, 0x39, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x07, 0x55, 0xa9]));
*/

/*
commands.push(new Buffer([0xfa, 0x03, 0x00, 0x39, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
commands.push(new Buffer([0xc0, 0xc7, 0x55, 0xa9]));
*/

// 7 byte header
// 54 led bytes
// 3 byte footer
command = new Buffer(54 + 7 + 3);
command[0] = 0xfa;
command[1] = 0x03;
command[3] = 0x39;
command[4] = 0x01;
command[6] = 0x06;
command[62] = 0x55;
command[63] = 0xa9;



function sendCommand(data) {
    if (!connected) {
        console.log("Sending failed: not connected");
        return;
    }
    let parity = 0x07;
    let i = 0;
    let bytesSending = 0;
    for (i = startDataIndex; i < startDataIndex + data.length; i++) {
        command[i] = data[i - startDataIndex];
        parity = (parity ^ command[i]);
    }
    command[61] = parity;

    bytesToSend = command.length;
    console.log("Sending " + bytesToSend + " bytes");
    i = 0;
    while (bytesToSend > 0) {
        bytesSending = bytesToSend;
        if (bytesSending > 20) {
            //            bytesSending = 20;
        }
        let sendBuf = command.slice(i, i + bytesSending);
        console.log("send=" + bytesSending + " (" + i + "," + (i + bytesSending) + ")");
        bm.write(sendBuf);
        i += bytesSending;
        bytesToSend -= bytesSending;

        console.log(sendBuf.toString('hex'));
        console.log(" ");
    }

}


// setup i2c
if (process.env.USEHW == 'true') {
    console.log('setup I2C');
    const i2c = require('i2c');
    const address = 0x52;
    const wire = new i2c(address, { device: process.env.HWADDR });
    // init
    wire.writeByte(0xF0, function(err) { console.log("Error I2C: " + err); });
    wire.writeByte(0x55, function(err) { console.log("Error I2C: " + err); });
    sleep.msleep(5);
    wire.writeByte(0xFB, function(err) { console.log("Error I2C: " + err); });
    wire.writeByte(0x00, function(err) { console.log("Error I2C: " + err); });
    console.log("I2C config done");

    function update() {
        let data = [0, 0, 0, 0, 0, 0];
        wire.writeByte(0x00, function(err) { console.log("I2C Error: " + err) });
        sleep.msleep(5);
        var wait = true;
        var tmo;
        for (let i = 0; i < 6; i++) {
            wait = true;
            tmo = 100;
            wire.readByte(function(err, res) {
                if (err) console.log("I2C read err:" + err);
                else data[i] = res;
                wait = false;
            });
            while (wait && --tmo > 0) { sleep.msleep(1) };
        }
        var res = data;
        let x = res[0];
        let y = res[1];
        let z = !(res[5] & 0x1);
        let c = !((res[5] & 0x2) >> 1);
        console.log(`x=${x}, y=${y}, z=${z}, c=${c}`);
        /*
         wire.readBytes(0x00, 6, function(err, res) {
             if (err) {
                 console.log("Error I2C: " + err);
             } else {
                 let x = res[0];
                 let y = res[1];
                 let z = !(res[5] & 0x1);
                 let c = !((res[5] & 0x2) >> 1);
                 console.log(`x=${x}, y=${y}, z=${z}, c=${c}`);
             }
         });
         */
    }

    setInterval(update, 1000);
}