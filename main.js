class SignalingChannel {
 constructor() {
   this.listeners = [];
   window.onMessage((event)=>{
    console.log('on message', event);
    for (let listener of this.listeners) {
     listener(event.data);
    }
   });
 }
 addEventListener(cb) {
    this.listeners.push(cb);
 }

 send(data) {
   console.log('sending data', data);
   window.parent.postMessage(data);
 }
}

const signalingChannel = new SignalingChannel();

async function makeCall() {
 const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
 const peerConnection = new RTCPeerConnection(configuration);
 signalingChannel.addEventListener('message', async message => {
  if (message.answer) {
   const remoteDesc = new RTCSessionDescription(message.answer);
   await peerConnection.setRemoteDescription(remoteDesc);
  }
 });
 const offer = await peerConnection.createOffer();
 await peerConnection.setLocalDescription(offer);
 signalingChannel.send({ 'offer': offer });
}

async function wait() {
 const peerConnection = new RTCPeerConnection(configuration);
 signalingChannel.addEventListener('message', async message => {
  if (message.offer) {
   peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
   const answer = await peerConnection.createAnswer();
   await peerConnection.setLocalDescription(answer);
   signalingChannel.send({ 'answer': answer });
  }
 });
}

signalingChannel.addEventListener('message', async message => {
 if (message.data.wait) {
  wait();
 }
 if (message.data.call) {
  makeCall();
 }
});
