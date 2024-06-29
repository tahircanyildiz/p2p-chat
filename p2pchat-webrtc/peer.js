const wrtc = require('wrtc');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const peerConnection = new wrtc.RTCPeerConnection();
let dataChannel;
let iceCandidates = [];

peerConnection.ondatachannel = (event) => {
  dataChannel = event.channel;
  setupDataChannel();
};

peerConnection.onicecandidate = ({ candidate }) => {
  if (candidate) {
    iceCandidates.push(candidate);
    console.log(`ICE Adayı: ${JSON.stringify(candidate)}`);
  } else {
    console.log('ICE aday toplama tamamlandı.');
    console.log(`Tüm ICE adayları: ${JSON.stringify(iceCandidates)}`);
  }
};

peerConnection.oniceconnectionstatechange = () => {
  console.log(`ICE Bağlantı Durumu: ${peerConnection.iceConnectionState}`);
};

const setupDataChannel = () => {
  dataChannel.onopen = () => {
    console.log('Veri kanalı açık');
    rl.on('line', (line) => {
      dataChannel.send(line);
    });
  };

  dataChannel.onmessage = (event) => {
    console.log(`Alınan mesaj: ${event.data}`);
  };

  dataChannel.onclose = () => {
    console.log('Veri kanalı kapalı');
  };
};

const teklifVeyaYanıt = async (tip) => {
  if (tip === 'teklif') {
    dataChannel = peerConnection.createDataChannel('chat');
    setupDataChannel();

    const teklif = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(teklif);
    console.log(`Teklif: ${JSON.stringify(peerConnection.localDescription)}`);
  } else {
    rl.question('Uzak teklif girin: ', async (teklif) => {
      await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(JSON.parse(teklif)));
      const yanıt = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(yanıt);
      console.log(`Yanıt: ${JSON.stringify(peerConnection.localDescription)}`);
    });
  }
};

const adayİşle = async () => {
  rl.question('Uzak ICE adaylarını girin (tek bir JSON array olarak): ', async (adaylar) => {
    const candidates = JSON.parse(adaylar);
    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
      } catch (error) {
        console.error('ICE Adayı eklenirken hata:', error);
      }
    }
  });
};

rl.question('Teklif olarak mı yoksa yanıt olarak mı başlamak istiyorsunuz? (teklif/yanıt) ', (tip) => {
  teklifVeyaYanıt(tip.trim());
  if (tip.trim() === 'yanıt') {
    adayİşle();
  }
});

// Uzak eşten gelen ICE adaylarını işle
adayİşle();
