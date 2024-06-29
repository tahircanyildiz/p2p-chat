const net = require('net');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let baglantiKapatildi = false;

function istemciBaslat(dinlemePort, baglanilacakPort) {
    const istemci = net.createConnection({ port: baglanilacakPort, host: 'localhost' }, () => {
        console.log(`Bağlandi localhost:${baglanilacakPort}`);

        rl.on('line', (line) => {
            istemci.write(line);
        });
    });

    istemci.on('data', (data) => {
        console.log(`Gelen mesaj: ${data}`);
    });

    istemci.on('end', () => {
        console.log('Bağlanti kesildi');
        if (!baglantiKapatildi) {
            rl.close();
            process.exit(0);
        }
    });

    istemci.on('error', (err) => {
        console.error('Bağlanti hatasi:', err.message);
        rl.close();
        process.exit(1); 
    });
}

rl.question('Kendi dinleme portunuzu girin: ', (dinlemePort) => {
    const sunucu = net.createServer((socket) => {
        socket.on('end', () => {
            console.log('İstemci bağlantisi kesildi');
            baglantiKapatildi = true;
            rl.close();
            process.exit(0);
        });

        rl.on('line', (line) => {
            socket.write(line);
        });
    });

    sunucu.listen(dinlemePort, () => {});

    sunucu.on('error', (err) => {console.error('Sunucu hatasi:', err.message);});

    rl.question('Bağlanmak istediğiniz portu girin: ', (baglanilacakPort) => {
        istemciBaslat(dinlemePort, baglanilacakPort);});
});

// Error olayını global olarak ele alarak programın beklenmedik şekilde sonlanmasını önler
process.on('uncaughtException', (err) => {
    console.error('Beklenmedik bir hata oluştu:', err);
    process.exit(1); // Programı hata durumunda sonlandır
});

process.on('unhandledRejection', (err) => {
    console.error('Beklenmedik bir promise hata oluştu:', err);
    process.exit(1); // Programı hata durumunda sonlandır
});
