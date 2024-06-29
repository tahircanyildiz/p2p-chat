const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let peerPort;

rl.question('Bağlanmak istediğiniz portu girin: ', answer => {
    peerPort = parseInt(answer);

    const client = net.createConnection({ port: peerPort }, () => {
        console.log(`Bağlandınız ${peerPort} portuna`);

        rl.addListener('line', input => {
            client.write(input);
        });
    });

    client.on('data', data => {
        console.log('Gelen:', data.toString());
    });

    client.on('end', () => {
        console.log('Bağlantı kesildi');
        rl.close();
    });

    client.on('error', err => {
        console.error('Bağlantı hatası:', err.message);
        rl.close();
    });
});
