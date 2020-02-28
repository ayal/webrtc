class SignalingChannel {
 constructor() {
   this.listeners = [];
   window.onmessage = ((event)=>{
    console.log('on message', event);
    for (let listener of this.listeners) {
     listener(event.data);
    }
   });
 }
 addEventListener(type, cb) {
    this.listeners.push(cb);
 }

 send(data) {
   console.log('sending data', data);
   window.parent.postMessage(data, '*');
 }
}

const signalingChannel = new SignalingChannel();

async function makeCall() {
 const peerConnection = new RTCPeerConnection();
  let sendChannel = peerConnection.createDataChannel("sendChannel");
  sendChannel.onopen = (e)=>console.log('open', e);
  sendChannel.onclose = (e)=>console.log('close', e);
 
 signalingChannel.addEventListener('message', async message => {
  if (message.message) {
   let data = JSON.parse(message.message);
   if (data.answer) {
    let answer = JSON.parse(data.answer);
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
    setTimeout(()=>{
      console.log('trying to send something...');
      sendChannel.send('HELOOOO');
    })
   }
  }
 });
 const offer = await peerConnection.createOffer();
 await peerConnection.setLocalDescription(offer);
 signalingChannel.send({ 'offer': JSON.stringify(offer)});
 
  peerConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);
 
 peerConnection.addEventListener('connectionstatechange', event => {
  console.log('connectionstatechange call', event);
    if (peerConnection.connectionState === 'connected') {
        // Peers connected!
    }
  });
}

async function wait() {
 const peerConnection = new RTCPeerConnection();
 
  remoteConnection.ondatachannel = (event)=>{
    receiveChannel = event.channel;
    receiveChannel.onmessage = (e)=>{console.log('on data message!', e)};
    receiveChannel.onopen = (e)=>console.log('open', e);
    receiveChannel.onclose = (e)=>console.log('close', e);
  };
 signalingChannel.addEventListener('message', async message => {
  if (message.message) {
   let data = JSON.parse(message.message);
   if (data.offer) {
    let offer = JSON.parse(data.offer);
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    signalingChannel.send({ 'answer': JSON.stringify(answer) });
   }
  }
 });
 
   peerConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);
 
 peerConnection.addEventListener('connectionstatechange', event => {
  console.log('connectionstatechange call', event);
    if (peerConnection.connectionState === 'connected') {
        // Peers connected!
    }
  });
}

signalingChannel.addEventListener('message', async message => {
 if (message.wait) {
  wait();
 }
 if (message.call) {
  makeCall();
 }
});
