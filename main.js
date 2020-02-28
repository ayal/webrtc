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
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

async function makeCall() {
 const peerConnection = new RTCPeerConnection(configuration);
 signalingChannel.addEventListener('message', async message => {
  if (message.message) {
   let data = JSON.parse(message.message);
   if (data.answer) {
    let answer = JSON.parse(data.answer);
    const remoteDesc = new RTCSessionDescription(data.answer);
    await peerConnection.setRemoteDescription(remoteDesc);
   }
  }
 });
 const offer = await peerConnection.createOffer();
 await peerConnection.setLocalDescription(offer);
 signalingChannel.send({ 'offer': JSON.stringify(offer)});
}

async function wait() {
 const peerConnection = new RTCPeerConnection(configuration);
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
}

signalingChannel.addEventListener('message', async message => {
 if (message.wait) {
  wait();
 }
 if (message.call) {
  makeCall();
 }
});
