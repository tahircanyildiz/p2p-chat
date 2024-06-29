const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const server = net.createServer(socket => {
    socket.on('data', data => {
        console.log('gelen mesaj:', data.toString());
    });

    socket.on('end', () => {
        console.log('Bağlantı sonlandı.');
    });

    socket.on('error', err => {
        console.error('Bağlantı hatası:', err.message);
    });
});

server.listen(3001, () => {});
rl.question('IP ve port no(örn: 192.168.1.40:3000): ', answer => {
    const [host, port] = answer.split(':');

    const client = net.createConnection({ port: parseInt(port), host }, () => {
        rl.prompt();

        rl.on('line', input => {
            client.write(input);
        });
    });

    client.on('data', data => {
        console.log('Karşı taraftan gelen mesaj:', data.toString());
        rl.prompt();
    });

    client.on('end', () => {
        console.log('Bağlantı sonlandı.');
        process.exit(0);
    });

    client.on('error', err => {
        console.log('Bağlanti sonlandi');
        process.exit(0);
    });
});
