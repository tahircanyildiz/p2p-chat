const net = require('net');

const PORT = 3000;
const connections = [];

const server = net.createServer(socket => {
    console.log('İstemci bağlandı:', socket.remoteAddress, socket.remotePort);
    connections.push(socket);

    socket.on('data', data => {
        console.log(`Gelen veri (${socket.remoteAddress}:${socket.remotePort}): ${data}`);
        broadcast(data, socket);
    });

    socket.on('end', () => {
        console.log('İstemci bağlantısı kesildi:', socket.remoteAddress, socket.remotePort);
        connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('error', err => {
        console.error('Soket hatası:', err.message);
    });
});

function broadcast(message, senderSocket) {
    connections.forEach(socket => {
        if (socket !== senderSocket) {
            socket.write(message);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Ana sunucu ${PORT} portunda dinleniyor`);
});
