const WebSocket = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const userId = process.argv[2];
const socket = new WebSocket('ws://localhost:8080');

let targetUserId;

socket.on('open', () => {
    socket.send(JSON.stringify({ type: 'giris', userId }));

    rl.question('Konusmak istediginiz kisinin ID\'sini gir: ', (userIdToChatWith) => {
        targetUserId = userIdToChatWith;
        socket.send(JSON.stringify({
            type: 'istek',
            to: targetUserId,
            from: userId
        }));
        console.log('istek gonderildi. Onay icin bekleyiniz..');
    });
});

socket.on('message', (data) => {
    const parsedMessage = JSON.parse(data);

    if (parsedMessage.type === 'onay_istegi') {
        rl.question(`Kullanici ${parsedMessage.from} mesaj isteginde bulundu. Onayliyor musun? (evet/hayir): `, (answer) => {
            if (answer.toLowerCase() === 'evet') {
                socket.send(JSON.stringify({
                    type: 'onay',
                    from: userId,
                    to: parsedMessage.from
                }));
            }
        });
    } else if (parsedMessage.type === 'onaylandi') {
        console.log(` ${parsedMessage.from} ile konusmaya hazirsin.`);
        rl.addListener('line', (line) => {
            socket.send(JSON.stringify({
                type: 'mesaj',
                to: targetUserId,
                message: line
            }));
        });
    } else if (parsedMessage.type === 'hata') {
        console.log(parsedMessage.message);
    } else if (parsedMessage.type === 'mesaj') {
        console.log(`Kullanici ${parsedMessage.from}: ${parsedMessage.message}`);
    }
});

socket.on('close', () => {
    console.log('Server\'dan ayrildi.');
    rl.close();
});

socket.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});