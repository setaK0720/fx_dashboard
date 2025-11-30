import { Box, Text } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { runBacktest, fetchAvailableData, fetchStrategies, loadData as fetchPriceData } from '../../lib/api';
import { createChart, ColorType, AreaSeries, CandlestickSeries } from 'lightweight-charts';

export const BacktestPanel = () => {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [config, setConfig] = useState({
        symbol: 'USDJPY',
        timeframe: 'M1',
        strategy: '',
        params: {} as any,
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        initial_cash: 10000,
        lot_size: 0.01,
        contract_size: 100000
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dataList, setDataList] = useState<any[]>([]);
    const [priceData, setPriceData] = useState<any[]>([]);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const priceChartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [data, stratList] = await Promise.all([
                fetchAvailableData(),
                fetchStrategies()
            ]);

            setDataList(data);
            setStrategies(stratList);

            // Set defaults
            if (data.length > 0 && stratList.length > 0) {
                const defaultStrat = stratList[0];
                const defaultParams = defaultStrat.params.reduce((acc: any, p: any) => {
                    acc[p.name] = p.default;
                    return acc;
                }, {});

                setConfig(prev => ({
                    ...prev,
                    symbol: data[0].symbol,
                    timeframe: data[0].timeframe,
                    strategy: defaultStrat.name,
                    params: defaultParams
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStrategyChange = (stratName: string) => {
        const strat = strategies.find(s => s.name === stratName);
        if (!strat) return;

        const defaultParams = strat.params.reduce((acc: any, p: any) => {
            acc[p.name] = p.default;
            return acc;
        }, {});

        setConfig(prev => ({
            ...prev,
            strategy: stratName,
            params: defaultParams
        }));
    };

    const handleParamChange = (name: string, value: any, type: string) => {
        setConfig(prev => ({
            ...prev,
            params: {
                ...prev.params,
                [name]: type === 'number' ? Number(value) : value
            }
        }));
    };

    const handleRun = async () => {
        setLoading(true);
        setResults(null);
        setError(null);
        try {
            const payload = {
                ...config,
            };
            const data = await runBacktest(payload);
            setResults(data);

            // Fetch price data for the chart
            const priceDataRaw = await fetchPriceData(config.symbol, config.timeframe, config.start_date, config.end_date);
            setPriceData(priceDataRaw);

        } catch (error: any) {
            console.error(error);
            setError(error.message || 'An error occurred during backtest');
        } finally {
            setLoading(false);
        }
    };

    // Chart rendering logic
    useEffect(() => {
        if (!results || !chartContainerRef.current || !results.equity_curve) return;

        const container = chartContainerRef.current;
        let chart: any = null;

        const initChart = () => {
            if (container.clientWidth === 0 || container.clientHeight === 0) return;
            if (chart) return;

            try {
                chart = createChart(container, {
                    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#DDD' },
                    grid: { vertLines: { color: 'rgba(42, 46, 57, 0.5)' }, horzLines: { color: 'rgba(42, 46, 57, 0.5)' } },
                    width: container.clientWidth,
                    height: 300,
                    timeScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
                });

                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor: '#2962FF', topColor: '#2962FF', bottomColor: 'rgba(41, 98, 255, 0.28)',
                });

                const chartData = results.equity_curve.map((item: any) => ({
                    time: new Date(item.time).getTime() / 1000 as any,
                    value: item.equity
                }));
                chartData.sort((a: any, b: any) => a.time - b.time);

                areaSeries.setData(chartData);
                chart.timeScale().fitContent();
            } catch (e) { console.error(e); }
        };

        initChart();
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    if (!chart) initChart();
                    else chart.applyOptions({ width: entry.contentRect.width });
                }
            }
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chart) chart.remove();
        };
    }, [results]);

    // Price Chart rendering logic
    useEffect(() => {
        if (!priceData.length || !priceChartContainerRef.current || !results) return;

        const container = priceChartContainerRef.current;
        let chart: any = null;

        const initChart = () => {
            if (container.clientWidth === 0 || container.clientHeight === 0) return;
            if (chart) return;

            try {
                chart = createChart(container, {
                    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#DDD' },
                    grid: { vertLines: { color: 'rgba(42, 46, 57, 0.5)' }, horzLines: { color: 'rgba(42, 46, 57, 0.5)' } },
                    width: container.clientWidth,
                    height: 400,
                    timeScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
                });

                const candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
                });

                const chartData = priceData.map((d: any) => ({
                    time: new Date(d.time).getTime() / 1000 as any,
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                }));
                chartData.sort((a: any, b: any) => a.time - b.time);

                candlestickSeries.setData(chartData);

                const markers: any[] = [];
                results.trades.forEach((trade: any) => {
                    const entryTime = new Date(trade.entry_time).getTime() / 1000;
                    const exitTime = new Date(trade.exit_time).getTime() / 1000;

                    markers.push({
                        time: entryTime,
                        position: trade.type === 'BUY' ? 'belowBar' : 'aboveBar',
                        color: trade.type === 'BUY' ? '#26a69a' : '#ef5350',
                        shape: trade.type === 'BUY' ? 'arrowUp' : 'arrowDown',
                        text: trade.type === 'BUY' ? 'Buy' : 'Sell',
                    });

                    markers.push({
                        time: exitTime,
                        position: trade.type === 'BUY' ? 'aboveBar' : 'belowBar',
                        color: trade.type === 'BUY' ? '#26a69a' : '#ef5350',
                        shape: trade.type === 'BUY' ? 'arrowDown' : 'arrowUp',
                        text: 'Close',
                    });
                });

                markers.sort((a: any, b: any) => a.time - b.time);
                candlestickSeries.setMarkers(markers);

                chart.timeScale().fitContent();
            } catch (e) { console.error(e); }
        };

        initChart();
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    if (!chart) initChart();
                    else chart.applyOptions({ width: entry.contentRect.width });
                }
            }
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chart) chart.remove();
        };
    }, [priceData, results]);

    const currentStrategy = strategies.find(s => s.name === config.strategy);

    return (
        <Box bg="glass.100" p={6} borderRadius="xl" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>Backtest Engine</Text>

            {/* Configuration */}
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Data Source</Text>
                    <select
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            background: '#1A202C', // gray.900
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        value={`${config.symbol}|${config.timeframe}`}
                        onChange={(e) => {
                            const [s, t] = e.target.value.split('|');
                            setConfig({ ...config, symbol: s, timeframe: t });
                        }}
                    >
                        {dataList.length === 0 && <option>Loading or No Data...</option>}
                        {dataList.map((d, i) => (
                            <option key={i} value={`${d.symbol}|${d.timeframe}`} style={{ color: 'black', backgroundColor: 'white' }}>
                                {d.symbol} {d.timeframe} ({new Date(d.start).toLocaleDateString()} ~ {new Date(d.end).toLocaleDateString()}, {d.count} bars)
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Strategy</Text>
                    <select
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            background: '#1A202C', // gray.900
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        value={config.strategy}
                        onChange={(e) => handleStrategyChange(e.target.value)}
                    >
                        {strategies.length === 0 && <option>Loading strategies...</option>}
                        {strategies.map((s, i) => (
                            <option key={i} value={s.name} style={{ color: 'black', backgroundColor: 'white' }}>{s.name}</option>
                        ))}
                    </select>
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Initial Cash</Text>
                    <input
                        type="number"
                        value={config.initial_cash}
                        onChange={(e) => setConfig({ ...config, initial_cash: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Lot Size</Text>
                    <input
                        type="number"
                        step="0.01"
                        value={config.lot_size}
                        onChange={(e) => setConfig({ ...config, lot_size: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Contract Size</Text>
                    <input
                        type="number"
                        value={config.contract_size}
                        onChange={(e) => setConfig({ ...config, contract_size: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Start Date</Text>
                    <input
                        type="date"
                        value={config.start_date}
                        onChange={(e) => setConfig({ ...config, start_date: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>End Date</Text>
                    <input
                        type="date"
                        value={config.end_date}
                        onChange={(e) => setConfig({ ...config, end_date: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                </Box>

                {/* Dynamic Parameters */}
                {currentStrategy?.params.map((param: any) => (
                    <Box key={param.name}>
                        <Text color="gray.300" fontSize="sm" mb={1}>{param.label}</Text>
                        <input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={config.params[param.name] || ''}
                            onChange={(e) => handleParamChange(param.name, e.target.value, param.type)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 35, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                        />
                    </Box>
                ))}
            </Box>

            <button
                onClick={handleRun}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: '#3182ce',
                    color: 'white',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginBottom: '32px'
                }}
            >
                {loading ? 'Running...' : 'Run Backtest'}
            </button>

            {error && (
                <div style={{ padding: '16px', backgroundColor: '#F56565', color: 'white', borderRadius: '8px', marginBottom: '16px' }}>
                    Error: {error}
                </div>
            )}

            {/* Results */}
            {results && (
                <Box>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#A0AEC0', marginBottom: '4px' }}>Total Trades</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{results.total_trades}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#A0AEC0', marginBottom: '4px' }}>Win Rate</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: results.win_rate >= 50 ? '#48BB78' : '#F56565' }}>{results.win_rate}%</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#A0AEC0', marginBottom: '4px' }}>Total Profit</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: results.total_profit >= 0 ? '#48BB78' : '#F56565' }}>{results.total_profit}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#A0AEC0', marginBottom: '4px' }}>Profit Factor</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{results.profit_factor}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#A0AEC0', marginBottom: '4px' }}>Max Drawdown</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F56565' }}>{results.max_drawdown}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Price Chart</p>
                        <div ref={priceChartContainerRef} style={{ width: '100%', height: '400px' }} />
                    </div>

                    <div style={{ marginBottom: '32px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Equity Curve</p>
                        <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
                    </div>

                    <div style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', color: 'white' }}>Type</th>
                                    <th style={{ padding: '8px', textAlign: 'left', color: 'white' }}>Entry Time</th>
                                    <th style={{ padding: '8px', textAlign: 'right', color: 'white' }}>Entry Price</th>
                                    <th style={{ padding: '8px', textAlign: 'left', color: 'white' }}>Exit Time</th>
                                    <th style={{ padding: '8px', textAlign: 'right', color: 'white' }}>Exit Price</th>
                                    <th style={{ padding: '8px', textAlign: 'right', color: 'white' }}>Profit</th>
                                    <th style={{ padding: '8px', textAlign: 'left', color: 'white' }}>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.trades.map((trade: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px', color: trade.type === 'BUY' ? '#48BB78' : '#F56565' }}>{trade.type}</td>
                                        <td style={{ padding: '8px', color: '#E2E8F0' }}>{new Date(trade.entry_time).toLocaleString()}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: '#E2E8F0' }}>{trade.entry_price}</td>
                                        <td style={{ padding: '8px', color: '#E2E8F0' }}>{new Date(trade.exit_time).toLocaleString()}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: '#E2E8F0' }}>{trade.exit_price}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: trade.profit >= 0 ? '#48BB78' : '#F56565' }}>{trade.profit.toFixed(2)}</td>
                                        <td style={{ padding: '8px', color: '#A0AEC0' }}>{trade.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Box>
            )}
        </Box>
    );
};
