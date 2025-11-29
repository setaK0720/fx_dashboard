import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const WS_URL = `ws://${window.location.host}/ws/prices`;

export interface PriceData {
    symbol: string;
    bid: number;
    ask: number;
    spread: number;
    time: number;
}

export const usePrices = () => {
    const { lastMessage, readyState } = useWebSocket(WS_URL, {
        shouldReconnect: () => true,
    });

    const [prices, setPrices] = useState<Record<string, PriceData>>({});

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const data = JSON.parse(lastMessage.data);
                setPrices(data);
            } catch (e) {
                console.error("Failed to parse price message", e);
            }
        }
    }, [lastMessage]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return {
        prices,
        isConnected: readyState === ReadyState.OPEN,
        connectionStatus
    };
};
