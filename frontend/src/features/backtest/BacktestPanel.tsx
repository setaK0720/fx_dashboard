import { Box, Text, SimpleGrid, Input, Button, Table, Grid, GridItem } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { runBacktest, fetchAvailableData, fetchStrategies, loadData } from '../../lib/api';
import { createChart, ColorType, AreaSeries, CandlestickSeries } from 'lightweight-charts';
import { toaster } from '../../components/ui/toaster';

export const BacktestPanel = () => {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [config, setConfig] = useState({
        symbol: 'USDJPY',
        timeframe: 'M1',
        strategy: '',
        params: {} as any,
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        initial_cash: 10000
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
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
            toaster.create({ title: 'Failed to load data', type: 'error' });
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
        try {
            const payload = {
                ...config,
            };
            const data = await runBacktest(payload);
            setResults(data);

            // Fetch price data for the chart
            const priceDataRaw = await loadData(config.symbol, config.timeframe, config.start_date, config.end_date);
            setPriceData(priceDataRaw);

        } catch (error: any) {
            console.error(error);
            toaster.create({
                title: 'Error',
                description: error.message || 'Backtest failed',
                type: 'error',
            });
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

                // Add markers for trades
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

            <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
                {/* Sidebar: Configuration */}
                <GridItem>
                    <SimpleGrid columns={1} gap={4}>
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
                                        {d.symbol} {d.timeframe} ({d.count} bars)
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
                            <Input
                                type="number"
                                value={config.initial_cash}
                                onChange={(e) => setConfig({ ...config, initial_cash: Number(e.target.value) })}
                                bg="glass.200" color="white"
                            />
                        </Box>
                        <Box>
                            <Text color="gray.300" fontSize="sm" mb={1}>Start Date</Text>
                            <Input
                                type="date"
                                value={config.start_date}
                                onChange={(e) => setConfig({ ...config, start_date: e.target.value })}
                                bg="glass.200" color="white"
                            />
                        </Box>
                        <Box>
                            <Text color="gray.300" fontSize="sm" mb={1}>End Date</Text>
                            <Input
                                type="date"
                                value={config.end_date}
                                onChange={(e) => setConfig({ ...config, end_date: e.target.value })}
                                bg="glass.200" color="white"
                            />
                        </Box>

                        {/* Dynamic Parameters */}
                        {currentStrategy?.params.map((param: any) => (
                            <Box key={param.name}>
                                <Text color="gray.300" fontSize="sm" mb={1}>{param.label}</Text>
                                <Input
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    value={config.params[param.name] || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value, param.type)}
                                    bg="glass.200" color="white"
                                />
                            </Box>
                        ))}

                        <Button
                            onClick={handleRun}
                            loading={loading}
                            bg="teal.600"
                            color="white"
                            _hover={{ bg: "teal.700" }}
                            width="full"
                            mt={4}
                        >
                            Run Backtest
                        </Button>
                    </SimpleGrid>
                </GridItem>

                {/* Main Content: Results */}
                <GridItem>
                    {results ? (
                        <Box>
                            <SimpleGrid columns={{ base: 2, md: 5 }} gap={4} mb={8}>
                                <StatCard label="Total Trades" value={results.total_trades} />
                                <StatCard label="Win Rate" value={`${results.win_rate}%`} color={results.win_rate >= 50 ? "green.400" : "red.400"} />
                                <StatCard label="Total Profit" value={results.total_profit} isCurrency color={results.total_profit >= 0 ? "green.400" : "red.400"} />
                                <StatCard label="Profit Factor" value={results.profit_factor} />
                                <StatCard label="Max Drawdown" value={results.max_drawdown} isCurrency color="red.400" />
                            </SimpleGrid>

                            <Box mb={8} bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                                <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Price Chart</Text>
                                <div ref={priceChartContainerRef} style={{ width: '100%', height: '400px' }} />
                            </Box>

                            <Box mb={8} bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                                <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Equity Curve</Text>
                                <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
                            </Box>

                            <Box overflowX="auto" bg="rgba(0,0,0,0.2)" borderRadius="md">
                                <Table.Root variant="line" size="sm" interactive>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700">Entry Time</Table.ColumnHeader>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700">Type</Table.ColumnHeader>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700" textAlign="right">Entry Price</Table.ColumnHeader>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700">Exit Time</Table.ColumnHeader>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700" textAlign="right">Exit Price</Table.ColumnHeader>
                                            <Table.ColumnHeader color="white" bg="gray.800" borderBottomColor="gray.700" textAlign="right">Profit</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {results.trades.map((trade: any, i: number) => (
                                            <Table.Row key={i} bg="transparent" _hover={{ bg: 'whiteAlpha.100' }}>
                                                <Table.Cell color="gray.200" borderBottomColor="gray.700">{trade.entry_time}</Table.Cell>
                                                <Table.Cell color={trade.type === 'BUY' ? 'green.400' : 'red.400'} borderBottomColor="gray.700">{trade.type}</Table.Cell>
                                                <Table.Cell color="gray.200" textAlign="right" borderBottomColor="gray.700">{trade.entry_price}</Table.Cell>
                                                <Table.Cell color="gray.200" borderBottomColor="gray.700">{trade.exit_time}</Table.Cell>
                                                <Table.Cell color="gray.200" textAlign="right" borderBottomColor="gray.700">{trade.exit_price}</Table.Cell>
                                                <Table.Cell color={trade.profit >= 0 ? 'green.400' : 'red.400'} textAlign="right" borderBottomColor="gray.700">
                                                    {trade.profit.toFixed(2)}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </Box>
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="400px" bg="rgba(0,0,0,0.2)" borderRadius="md">
                            <Text color="gray.500">Run a backtest to see results</Text>
                        </Box>
                    )}
                </GridItem>
            </Grid>
        </Box>
    );
};

const StatCard = ({ label, value, isCurrency = false, color = "white" }: any) => (
    <Box bg="glass.200" p={4} borderRadius="md" textAlign="center">
        <Text fontSize="sm" color="gray.400" mb={1}>{label}</Text>
        <Text fontSize="xl" fontWeight="bold" color={color}>
            {isCurrency && Number(value) >= 0 ? '+' : ''}{value}
        </Text>
    </Box>
);
