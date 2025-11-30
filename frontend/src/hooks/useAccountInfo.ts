import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const WS_URL = `ws://${window.location.host}/ws/account`;

export interface AccountInfo {
    balance: number;
    equity: number;
    margin: number;
    margin_free: number;
    margin_level: number;
    profit: number;
    credit: number;
    currency: string;
    leverage: number;
    name: string;
    account_name: string;
    server: string;
    login: number;
}

export const useAccountInfo = () => {
    const { lastMessage, readyState } = useWebSocket(WS_URL, {
        shouldReconnect: () => true,
    });

    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const data = JSON.parse(lastMessage.data);
                setAccountInfo(data);
            } catch (e) {
                console.error("Failed to parse account info message", e);
            }
        }
    }, [lastMessage]);

    return {
        accountInfo,
        isConnected: readyState === ReadyState.OPEN,
    };
};
