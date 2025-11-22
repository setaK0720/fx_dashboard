const API_BASE_URL = 'http://localhost:8000/api';

export interface BotStatus {
    is_running: boolean;
    message: string;
    last_updated: string | null;
}

export interface Position {
    id: number;
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    open_price: number;
    current_price: number;
    profit: number;
}

export const fetchStatus = async (): Promise<BotStatus> => {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) {
        throw new Error('Failed to fetch status');
    }
    return response.json();
};

export const fetchPositions = async (): Promise<Position[]> => {
    const response = await fetch(`${API_BASE_URL}/positions`);
    if (!response.ok) {
        throw new Error('Failed to fetch positions');
    }
    return response.json();
};
