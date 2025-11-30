const API_BASE_URL = '/api';

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
        const errorData = await response.json().catch(() => ({ detail: 'Failed to close position' }));
        throw new Error(errorData.detail || 'Failed to close position');
    }
    return response.json();
};

export const closePosition = async (ticket: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/positions/${ticket}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to close position' }));
        throw new Error(errorData.detail || 'Failed to close position');
    }
    return response.json();
};

export const closeAllPositions = async (type: 'BUY' | 'SELL' | 'ALL' = 'ALL'): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/positions?type=${type}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to close all positions' }));
        throw new Error(errorData.detail || 'Failed to close all positions');
    }
    return response.json();
};

export interface HistoryPosition {
    position_id: number;
    symbol: string;
    type: string;
    volume: number;
    open_price: number;
    open_time: number;
    close_price: number;
    close_time: number | null;
    profit: number;
    swap: number;
    commission: number;
    status: string;
}

export interface HistoryParams {
    days?: number;
    startDate?: string;
    endDate?: string;
}

export const fetchHistory = async (params: HistoryParams = { days: 30 }): Promise<HistoryPosition[]> => {
    const queryParams = new URLSearchParams();
    if (params.startDate && params.endDate) {
        queryParams.append('start_date', params.startDate);
        queryParams.append('end_date', params.endDate);
    } else {
        queryParams.append('days', (params.days || 30).toString());
    }

    const response = await fetch(`${API_BASE_URL}/history?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    return response.json();
};


export interface DataDownloadRequest {
    symbol: string;
    timeframe: string;
    start_date: string;
    end_date: string;
}

export interface DataFile {
    symbol: string;
    timeframe: string;
    start: string;
    end: string;
    count: number;
    filename: string;
}

export const downloadData = async (request: DataDownloadRequest): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/data/download`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to download data' }));
        throw new Error(errorData.detail || 'Failed to download data');
    }
    return response.json();
};

export const listData = async (): Promise<DataFile[]> => {
    const response = await fetch(`${API_BASE_URL}/data/list?t=${new Date().getTime()}`);
    if (!response.ok) {
        throw new Error('Failed to list data');
    }
    return response.json();
};

export const loadData = async (symbol: string, timeframe: string, startDate?: string, endDate?: string): Promise<any[]> => {
    const queryParams = new URLSearchParams({ symbol, timeframe });
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/data/load?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to load data');
    }
    return response.json();
};

export interface SandboxCondition {
    indicator: string;
    operator: string;
    value: number;
    action: string;
}

export interface SandboxRequest {
    symbol: string;
    timeframe: string;
    start_date?: string;
    end_date?: string;
    conditions: SandboxCondition[];
    tp: number;
    sl: number;
}

export const runSandbox = async (request: SandboxRequest): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/sandbox/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to run simulation' }));
        throw new Error(errorData.detail || 'Failed to run simulation');
    }
    return response.json();
};

export const fetchAccountAnalysis = async (days: number = 30, startDate?: string, endDate?: string): Promise<any> => {
    const queryParams = new URLSearchParams({ days: days.toString() });
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/analysis/account?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch account analysis');
    }
    return response.json();
};


export const saveStrategy = async (name: string, config: any) => {
    const response = await fetch(`${API_BASE_URL}/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config }),
    });
    if (!response.ok) throw new Error('Failed to save strategy');
    return response.json();
};

export const deleteStrategy = async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/strategies/${name}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete strategy');
    return response.json();
};

export const getStrategy = async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/strategies/${name}`);
    if (!response.ok) throw new Error('Failed to fetch strategy');
    return response.json();
};

export const fetchStrategies = async () => {
    const response = await fetch(`${API_BASE_URL}/backtest/strategies`);
    if (!response.ok) throw new Error('Failed to fetch strategies');
    return response.json();
};

export const runBacktest = async (params: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/backtest/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to run backtest' }));
        throw new Error(errorData.detail || 'Failed to run backtest');
    }
    return response.json();
};

export const fetchAvailableData = listData;
