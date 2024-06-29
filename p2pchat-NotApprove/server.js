const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = {};

server.on('connection', (socket) => {
    let userId;

    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'giris') {
            userId = parsedMessage.userId;
            clients[userId] = socket;
            console.log(`Kullanici ${userId} baglandi.`);
        } else if (parsedMessage.type === 'mesaj') {
            const targetSocket = clients[parsedMessage.to];
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                targetSocket.send(JSON.stringify({
                    from: userId,
                    message: parsedMessage.message
                }));
                console.log(`Mesaj ${parsedMessage.to} kullanıcısına gönderildi.`);
            } else {
                socket.send(JSON.stringify({
                    type: 'hata',
                    message: 'Bu kullanıcıya mesaj gönderilemiyor.'
                }));
            }
        }
    });

    socket.on('close', () => {
        if (userId) {
            delete clients[userId];
            console.log(`Kullanici ${userId} ayrildi.`);
        }
    });
});

console.log('WebSocket server started on ws://localhost:8080');