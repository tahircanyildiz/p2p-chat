var net = require('net');
var readline = require('readline');

var fifoRead = '\\\\.\\pipe\\peer1_to_peer2';
var fifoWrite = '\\\\.\\pipe\\peer2_to_peer1';

var server = net.createServer((stream) => {
  stream.on('data', (mesaj) => {
    console.log(`Kullanici 1: ${mesaj.toString()}`);
  });
});

server.listen(fifoRead, () => {});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
    var client = net.createConnection(fifoWrite, () => {
    client.write(line);
    client.end();
  });
});