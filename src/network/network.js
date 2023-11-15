function getTimestamp() {
  const now = new Date();
  return now.getTime();
}

async function setupWebRTC(peerConnection, dataChannel, signalingServer) {
  try {
    // signalingServer.onmessage = async (event) => {
    //   const message = JSON.parse(event.data);

    //   if (message.type === 'offer') {
    //     peerConnection.setRemoteDescription(new RTCSessionDescription(message));
    //     const answer = await peerConnection.createAnswer();
    //     await peerConnection.setLocalDescription(answer);

    //     signalingServer.send(JSON.stringify(answer));
    //   } else if (message.type === 'answer') {
    //     peerConnection.setRemoteDescription(new RTCSessionDescription(message));
    //   } else if (message.type === 'ice-candidate') {
    //     const candidate = new RTCIceCandidate(message.candidate);
    //     peerConnection.addIceCandidate(candidate);
    //   }
    // };

    peerConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      dataChannel.onopen = () => {
        dataChannel.send('Hello from React!');
      };

      dataChannel.onmessage = (event) => {
        console.log('Received data from peer:', event.data);
      };
    };

    // Create an offer to initiate the connection
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    signalingServer.send(JSON.stringify(offer));
  } catch (error) {
    console.error('WebRTC setup error:', error);
  }
}

// function sendRTCMessage(peerConnection, dataChannel, obj) {
//   // TODO:
// }

function sendWebsocketUpdate(websocket, message) {
  websocket.send(JSON.stringify(message));
}

export { getTimestamp, setupWebRTC, sendWebsocketUpdate };
