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
    time: number; // Unix timestamp
    profit: number;
}

export interface OrderCreate {
    symbol: string;
    order_type: 'BUY' | 'SELL';
    volume: number;
}

export interface OrderResponse {
    order_id: string;
    status: string;
    message: string;
}

export interface BacktestRequest {
    symbol: string;
    timeframe: string;
    period_days: number;
    initial_cash: number;
    short_window: number;
    long_window: number;
}

export interface BacktestResponse {
    return_pct: number;
    win_rate: number;
    profit_factor: number;
    trades: number;
    equity_curve: { time: string; equity: number }[];
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

export const placeOrder = async (order: OrderCreate): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    });
    if (!response.ok) {
        throw new Error('Failed to place order');
    }
    return response.json();
};

export const runBacktest = async (request: BacktestRequest): Promise<BacktestResponse> => {
    const response = await fetch(`${API_BASE_URL}/backtest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        throw new Error('Failed to run backtest');
    }
    return response.json();
};
