const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = {};
let pendingRequests = {};

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
                if (pendingRequests[parsedMessage.to] && pendingRequests[parsedMessage.to][userId]) {
                    targetSocket.send(JSON.stringify({
                        from: userId,
                        message: parsedMessage.message
                    }));
                } else {
                    socket.send(JSON.stringify({
                        type: 'hata',
                        message: 'Bu kullanıcıya mesaj göndermek için onay almanız gerekiyor.'
                    }));
                }
            }
        } else if (parsedMessage.type === 'istek') {
            console.log(` ${parsedMessage.from} \'den ${parsedMessage.to}\ye istek`); // 

            const targetSocket = clients[parsedMessage.to];
            if (!targetSocket) {
                console.log(`soket bulunamadi ${parsedMessage.to}`);
            } else {
                console.log(`soket bulundu ${parsedMessage.to}: ${targetSocket.readyState}`);
            }

            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                pendingRequests[parsedMessage.to] = pendingRequests[parsedMessage.to] || {};
                pendingRequests[parsedMessage.to][parsedMessage.from] = false;
                targetSocket.send(JSON.stringify({
                    type: 'onay_istegi',
                    from: parsedMessage.from
                }));
                console.log('Onay istegi gonderildi');
            }
        } else if (parsedMessage.type === 'onay') {
            const targetSocket = clients[parsedMessage.to];
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                if (pendingRequests[userId] && pendingRequests[userId][parsedMessage.from] !== undefined) {
                    pendingRequests[userId][parsedMessage.from] = true;
                    targetSocket.send(JSON.stringify({
                        type: 'onaylandi',
                        from: parsedMessage.from,
                        to: userId
                    }));
                    console.log('Onaylandi.'); // Debug mesajı
                }
            }
        }
    });

    socket.on('close', () => {
        if (userId) {
            delete clients[userId];
            delete pendingRequests[userId];
            for (let requester in pendingRequests) {
                if (pendingRequests[requester][userId] !== undefined) {
                    delete pendingRequests[requester][userId];
                }
            }
            console.log(`Kullanici ${userId} ayrildi.`);
        }
    });
});

console.log('WebSocket server started on ws://localhost:8080');