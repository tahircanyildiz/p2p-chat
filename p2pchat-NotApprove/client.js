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
        console.log(`Konusmak istediginiz kisi: ${targetUserId}`);
        startChat();
    });
});

function startChat() {
    rl.on('line', (line) => {
        const message = line.trim(); 
        socket.send(JSON.stringify({
            type: 'mesaj',
            to: targetUserId,
            message: message,
            from: userId 
        }));
        rl.prompt(); 
    });
}

socket.on('message', (data) => {
    const parsedData = JSON.parse(data);
    console.log(`Kullanici ${parsedData.from}: ${parsedData.message}`);
});

socket.on('close', () => {
    console.log('Server\'dan ayrildi.');
    rl.close();
});

socket.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});