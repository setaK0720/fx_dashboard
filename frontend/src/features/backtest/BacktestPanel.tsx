import { Box, Text, SimpleGrid, Input, Button, Table } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { runBacktest, fetchAvailableData } from '../../lib/api';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import { toaster } from '../../components/ui/toaster';

export const BacktestPanel = () => {
    const [config, setConfig] = useState({
        symbol: 'USDJPY',
        timeframe: 'M1',
        strategy: 'SmaCross',
        params: '{"short_window": 10, "long_window": 30}',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        initial_cash: 10000
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [dataList, setDataList] = useState<any[]>([]);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadDataList();
    }, []);

    const loadDataList = async () => {
        try {
            const list = await fetchAvailableData();
            setDataList(list);
            if (list.length > 0) {
                setConfig(prev => ({
                    ...prev,
                    symbol: list[0].symbol,
                    timeframe: list[0].timeframe
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRun = async () => {
        setLoading(true);
        setResults(null);
        try {
            const params = JSON.parse(config.params);
            const payload = {
                ...config,
                params
            };
            const data = await runBacktest(payload);
            setResults(data);
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

    // Chart rendering logic (similar to AccountAnalysisPanel)
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

                areaSeries.setData(results.equity_curve);
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

    return (
        <Box bg="glass.100" p={6} borderRadius="xl" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>Backtest Engine</Text>

            {/* Configuration */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Data Source</Text>
                    <select
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        value={`${config.symbol}|${config.timeframe}`}
                        onChange={(e) => {
                            const [s, t] = e.target.value.split('|');
                            setConfig({ ...config, symbol: s, timeframe: t });
                        }}
                    >
                        {dataList.map((d, i) => (
                            <option key={i} value={`${d.symbol}|${d.timeframe}`} style={{ color: 'black' }}>
                                {d.symbol} {d.timeframe} ({d.count} bars)
                            </option>
                        ))}
                    </select>
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Strategy</Text>
                    <select
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        value={config.strategy}
                        onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
                    >
                        <option value="SmaCross" style={{ color: 'black' }}>SMA Cross</option>
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
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Short Window (SMA)</Text>
                    <Input
                        type="number"
                        value={JSON.parse(config.params).short_window}
                        onChange={(e) => {
                            const current = JSON.parse(config.params);
                            setConfig({ ...config, params: JSON.stringify({ ...current, short_window: Number(e.target.value) }) });
                        }}
                        bg="glass.200" color="white"
                    />
                </Box>
                <Box>
                    <Text color="gray.300" fontSize="sm" mb={1}>Long Window (SMA)</Text>
                    <Input
                        type="number"
                        value={JSON.parse(config.params).long_window}
                        onChange={(e) => {
                            const current = JSON.parse(config.params);
                            setConfig({ ...config, params: JSON.stringify({ ...current, long_window: Number(e.target.value) }) });
                        }}
                        bg="glass.200" color="white"
                    />
                </Box>
            </SimpleGrid>

            <Button
                onClick={handleRun}
                loading={loading}
                bg="teal.600"
                color="white"
                _hover={{ bg: "teal.700" }}
                width="full"
                mb={8}
            >
                Run Backtest
            </Button>

            {/* Results */}
            {results && (
                <Box>
                    <SimpleGrid columns={{ base: 2, md: 5 }} gap={4} mb={8}>
                        <StatCard label="Total Trades" value={results.total_trades} />
                        <StatCard label="Win Rate" value={`${results.win_rate}%`} color={results.win_rate >= 50 ? "green.400" : "red.400"} />
                        <StatCard label="Total Profit" value={results.total_profit} isCurrency color={results.total_profit >= 0 ? "green.400" : "red.400"} />
                        <StatCard label="Profit Factor" value={results.profit_factor} />
                        <StatCard label="Max Drawdown" value={results.max_drawdown} isCurrency color="red.400" />
                    </SimpleGrid>

                    <Box mb={8} bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                        <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Equity Curve</Text>
                        <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
                    </Box>

                    <Box overflowX="auto">
                        <Table.Root size="sm" variant="outline">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader color="white" bg="gray.800">Type</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Entry Time</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Entry Price</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Exit Time</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Exit Price</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Profit</Table.ColumnHeader>
                                    <Table.ColumnHeader color="white" bg="gray.800">Reason</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {results.trades.map((trade: any, i: number) => (
                                    <Table.Row key={i}>
                                        <Table.Cell color={trade.type === 'BUY' ? 'green.300' : 'red.300'}>{trade.type}</Table.Cell>
                                        <Table.Cell color="white">{new Date(trade.entry_time).toLocaleString()}</Table.Cell>
                                        <Table.Cell color="white">{trade.entry_price}</Table.Cell>
                                        <Table.Cell color="white">{new Date(trade.exit_time).toLocaleString()}</Table.Cell>
                                        <Table.Cell color="white">{trade.exit_price}</Table.Cell>
                                        <Table.Cell color={trade.profit >= 0 ? 'green.300' : 'red.300'}>{trade.profit.toFixed(2)}</Table.Cell>
                                        <Table.Cell color="gray.400">{trade.reason}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Box>
            )}
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
