import { Meteor } from 'meteor/meteor';
//var COMPORT="/dev/ttys002";
var COMPORT="/dev/ttyO1";
var byteDelimiter = function(emitter, buffer) {
    console.log('----------');
    console.log(buffer);
    console.log('RAW: ' + buffer);
    console.log('----------');
    for (var i = 0; i < buffer.length;) {
        if (buffer[i] == 0x44) {
            var bufseq = new Buffer(8);
            bufseq[0] = buffer[i];
            i++;
            for (var j = 1; j < 8; j++) {
                if (buffer[i] != 0x44)
                    bufseq[j] = buffer[i];
                else {
                    console.log('----------');
                    console.log('Bad Message: ' + bufseq);
                    console.log(bufseq);
                    console.log('----------');
                    break;
                }
                if (j == 7 || i >= buffer.length) {
                    emitter.emit('data', bufseq);
                    break;
                }
                else
                    i++;
            }
        }
        else
            i++;
    }
};

/* global notifier */
/* global EventDDP */
notifier = new EventDDP("notification");

notifier.addListener('hello', function(client, message) {
    console.log("Server +++ " + message);
});

var SerialPort = Meteor.npmRequire("serialport");

var serialPort = new SerialPort.SerialPort(COMPORT, {
    baudrate: 115200,
    parser: byteDelimiter
});

serialPort.on("open", function() {
    console.log("Open " + COMPORT);
});

serialPort.on('data', function(data) {
    console.log(data);
    console.log("Received: " + data);
    notifier.emit('rawdata', "" + data);
    if (data[0] == 0x44 && data[1] == 0x33) {
        try {
            if (data[2] == 0x34) {
            // Command response
                notifier.emit("cresponse", "command response");
            }
            if (data[2] == 0x33) {
            // Join info request
                var addr = data[4] * 256 + data[5];
                notifier.emit('joininfo', "JOIN INFO: Addr: (0x)" + addr.toString(16) + " Endpoint:" + data[6]);
            }
            if (data[2] == 0x32) {
            // Permit join response
                notifier.emit('permitjoin', "permit join response");
            }
            if (data[2] == 0x31) {
            // Get PAN_ID response
                notifier.emit('panid', "this is a pan id");
            }
        }
        catch (err) {
            console.log(err);
        }
    }
});

Meteor.startup(() => {
  // code to run on server at startup
});

function sendPermitJoin(validSec) {
    var buffer = new Buffer(8);
    buffer[0] = 0x44;
    buffer[1] = 0x31;
    buffer[2] = 0x32;
    buffer[3] = parseInt(validSec, 10);
    serialPort.write(buffer);
}
function actionPerform(buttonId, address, endpoint, oper) {
    var buffer = new Buffer(8);
    buffer[0] = 0x44;
    buffer[1] = 0x31;
    buffer[2] = 0x34;
    buffer[3] = ("" + buttonId).charCodeAt(0);
    var addrNum = parseInt(address, 16);
    buffer[4] = addrNum / 256;
    buffer[5] = addrNum % 256;
    var endpointNum = parseInt(endpoint, 10);
    buffer[6] = endpointNum;
    buffer[7] = oper.charCodeAt(0);

    console.log("Write to Serial " + buffer);
    console.log(buffer);
    serialPort.write(buffer);
}
function turnOff(buttonId, address, endpoint) {
    actionPerform(buttonId, address, endpoint, "0");
}
function turnOn(buttonId, address, endpoint) {
    console.log("turnOn:");
    actionPerform(buttonId, address, endpoint, "1");
}
function doCheck(buttonId, address, endpoint) {
    actionPerform(buttonId, address, endpoint, "2");    
}
function sendIRData(address, data) {
}
Meteor.methods({
    permitjoin: function(validSec) {
        sendPermitJoin(validSec);
    },
    on: function(buttonId, address, endpoint) {
        turnOn(buttonId, address, endpoint);
    },
    off: function(buttonId, address, endpoint) {
        turnOff(buttonId, address, endpoint);
    },
    checkStatus: function(buttonId, address, endpoint) {
        doCheck(buttonId, address, endpoint);
    },
    irsend: function(address, data) {
        sendIRData(address, data)
    }
})

