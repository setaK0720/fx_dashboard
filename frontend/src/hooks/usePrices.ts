import { useEffect, useState } from 'react';

const WS_URL = 'ws://localhost:8000/ws/prices';

export const usePrices = () => {
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            setLastMessage(event.data);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, []);

    return { lastMessage, isConnected };
};
