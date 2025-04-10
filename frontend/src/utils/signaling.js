const socket = new WebSocket('ws://localhost:5000');

socket.onopen = () => {
    console.log('Connected to WebSocket');
};

socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'offer') {
        handleOffer(data.offer);
    } else if (data.type === 'answer') {
        handleAnswer(data.answer);
    } else if (data.type === 'candidate') {
        handleCandidate(data.candidate);
    }
};

export const sendSignal = (data) => {
    socket.send(JSON.stringify(data));
};
