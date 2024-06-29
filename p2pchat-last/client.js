const WebSocket = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const userId = process.argv[2];

if (!userId) {
    console.error('Please provide a user ID as an argument.');
    process.exit(1);
}

const socket = new WebSocket('ws://localhost:3000');

socket.on('open', () => {
    socket.send(JSON.stringify({ type: 'register', userId }));

    rl.question('Enter the user ID to chat with: ', (targetUserId) => {
        rl.addListener('line', (line) => {
            socket.send(JSON.stringify({
                type: 'message',
                to: targetUserId,
                message: line
            }));
        });
    });
});

socket.on('message', (data) => {
    const parsedMessage = JSON.parse(data);
    console.log(`Message from ${parsedMessage.from}: ${parsedMessage.message}`);
});

socket.on('close', () => {
    console.log('Disconnected from the server');
    rl.close();
});

socket.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});