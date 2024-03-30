// meeting.js

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const hangUpButton = document.getElementById('hang-up');

// ... (WebRTC initialization code from script.js) ...
// meeting.js

// ... (WebRTC initialization code) ...

// Function to handle incoming SDP offers/answers
function handleSDP(sdp) {
    const rtcSessionDescription = new RTCSessionDescription(sdp);
    rtcPeerConnection.setRemoteDescription(rtcSessionDescription)
        .then(() => {
            if (sdp.type === 'offer') {
                return rtcPeerConnection.createAnswer();
            }
        })
        .then(answer => rtcPeerConnection.setLocalDescription(answer))
        .then(() => sendSDP(rtcPeerConnection.localDescription))
        .catch(error => console.error('Error handling SDP:', error));
}

// Function to handle incoming ICE candidates
function handleICE(ice) {
    const rtcIceCandidate = new RTCIceCandidate(ice);
    rtcPeerConnection.addIceCandidate(rtcIceCandidate)
        .catch(error => console.error('Error handling ICE:', error));
}

// ... (rest of the code) ...




// Event listener for the hang-up button
hangUpButton.addEventListener('click', hangUp);

// ... (additional meeting-specific code) ...

