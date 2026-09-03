import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function createStompClient(onMessageReceived, onStatusChange, onTypingReceived, onConnectionChange) {
    const token = localStorage.getItem('token');

    const client = new Client({
        webSocketFactory: () => new SockJS(`https://chat-app-production-2787.up.railway.app/ws?token=${token}`),
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('DEBUG: onConnect fired');
            if (onConnectionChange) onConnectionChange(true);

            client.subscribe('/user/queue/messages', (message) => {
                const body = JSON.parse(message.body);
                onMessageReceived(body);
            });

            client.subscribe('/topic/status', (message) => {
                const body = JSON.parse(message.body);
                if (onStatusChange) onStatusChange(body);
            });

            client.subscribe('/user/queue/typing', (message) => {
                const body = JSON.parse(message.body);
                if (onTypingReceived) onTypingReceived(body);
            });
        },
        onWebSocketClose: () => {
            console.log('DEBUG: onWebSocketClose fired');
            if (onConnectionChange) onConnectionChange(false);
        },
        onStompError: (frame) => {
            console.error('STOMP error', frame);
        },
    });

    client.activate();
    return client;
}

export function sendMessage(client, receiverUsername, content) {
    client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverUsername, content }),
    });
}

export function sendTypingStatus(client, receiverUsername, typing) {
    console.log('DEBUG: Sending typing status to', receiverUsername, '=', typing);
    client.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ receiverUsername, typing }),
    });
}