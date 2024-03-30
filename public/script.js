// script.js

// script.js

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startButton = document.getElementById('start-button');
const hangUpButton = document.getElementById('hang-up');

let localStream;
let remoteStream;
let rtcPeerConnection;

// Function to initialize WebRTC
async function initializeWebRTC() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        startButton.disabled = false;
        hangUpButton.disabled = true;

        startButton.addEventListener('click', startMeeting);
        hangUpButton.addEventListener('click', hangUp);
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

// Function to start the meeting
function startMeeting() {
    rtcPeerConnection = new RTCPeerConnection();

    // Add local stream to the connection
    localStream.getTracks().forEach(track => rtcPeerConnection.addTrack(track, localStream));

    // Set up event handlers
    rtcPeerConnection.onicecandidate = handleICECandidateEvent;
    rtcPeerConnection.ontrack = handleTrackEvent;

    // Create offer and set local description
    rtcPeerConnection.createOffer()
        .then(offer => rtcPeerConnection.setLocalDescription(offer))
        .then(() => {
            // Send the offer to the other peer (via signaling server, not implemented here)
            // You would typically use a signaling server to exchange SDP information between peers
            console.log('Offer created and set as local description.');
        })
        .catch(error => console.error('Error creating offer:', error));

    startButton.disabled = true;
    hangUpButton.disabled = false;
}

// Function to handle ICE candidate events
function handleICECandidateEvent(event) {
    if (event.candidate) {
        // Send the ICE candidate to the other peer (via signaling server, not implemented here)
        console.log('ICE Candidate:', event.candidate);
    }
}

// Function to handle incoming tracks
function handleTrackEvent(event) {
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
}

// Function to hang up and end the meeting
function hangUp() {
    // Close the connection, stop media tracks, etc.
    rtcPeerConnection.close();
    localStream.getTracks().forEach(track => track.stop());

    startButton.disabled = false;
    hangUpButton.disabled = true;
    remoteVideo.srcObject = null;
}

const generateLinkButton = document.getElementById('generate-link');
const copyLinkButton = document.getElementById('copy-link');

// Event listeners for new buttons
generateLinkButton.addEventListener('click', generateMeetingLink);
copyLinkButton.addEventListener('click', copyMeetingLinkToClipboard);

// Function to generate a meeting link
function generateMeetingLink() {
    const meetingLink = `${window.location.origin}/meeting.html`;
    alert(`Meeting Link: ${meetingLink}`);
}

// Function to copy the meeting link to the clipboard
function copyMeetingLinkToClipboard() {
    const meetingLink = `${window.location.origin}/meeting.html`;
    navigator.clipboard.writeText(meetingLink)
        .then(() => alert('Meeting Link copied to clipboard'))
        .catch(error => console.error('Error copying link to clipboard:', error));
}

// Call the initializeWebRTC function when the script is loaded
initializeWebRTC();

// script.js

// ... (previous code) ...

const ws = new WebSocket('ws://localhost:8080'); // Change the URL to your signaling server

ws.onmessage = event => {
    const message = JSON.parse(event.data);

    if (message.sdp) {
        handleSDP(message.sdp);
    } else if (message.ice) {
        handleICE(message.ice);
    }
};

// Function to send SDP offer/answer to the other peer
function sendSDP(description) {
    const message = { sdp: description };
    ws.send(JSON.stringify(message));
}

// Function to send ICE candidate to the other peer
function sendICE(candidate) {
    const message = { ice: candidate };
    ws.send(JSON.stringify(message));
}

// ... (rest of the code) ...

// Function to generate a random string of given length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to generate a meeting link
function generateMeetingLink() {
    return `https://encryptomeet.com/meeting/${generateRandomString(10)}`;
}

// Function to generate a meeting ID
function generateMeetingID() {
    return generateRandomString(8);
}

// Function to generate a meeting password
function generateMeetingPassword() {
    return generateRandomString(6);
}

