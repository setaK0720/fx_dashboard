import { Box, Flex, Text, SimpleGrid, Spinner, Input, Button } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { fetchAccountAnalysis } from '../../lib/api';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import { toaster } from '../../components/ui/toaster';

export const AccountAnalysisPanel = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(30);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await fetchAccountAnalysis(days);
            setStats(data);
        } catch (error: any) {
            console.error(error);
            toaster.create({
                title: 'Error',
                description: 'Failed to load account analysis',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [days]);

    useEffect(() => {
        if (!stats || !chartContainerRef.current || stats.equity_curve.length === 0) return;

        const container = chartContainerRef.current;
        let chart: any = null;

        const initChart = () => {
            if (container.clientWidth === 0 || container.clientHeight === 0) return;
            if (chart) return; // Already initialized

            try {
                chart = createChart(container, {
                    layout: {
                        background: { type: ColorType.Solid, color: 'transparent' },
                        textColor: '#DDD',
                    },
                    grid: {
                        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
                    },
                    width: container.clientWidth,
                    height: 300,
                    timeScale: {
                        borderColor: 'rgba(197, 203, 206, 0.8)',
                    },
                });

                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor: '#2962FF',
                    topColor: '#2962FF',
                    bottomColor: 'rgba(41, 98, 255, 0.28)',
                });

                areaSeries.setData(stats.equity_curve);
                chart.timeScale().fitContent();
            } catch (e) {
                console.error("Failed to create chart:", e);
            }
        };

        // Initial attempt
        initChart();

        // ResizeObserver to handle size changes (e.g. from 0 to something)
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    if (!chart) {
                        initChart();
                    } else {
                        chart.applyOptions({ width: entry.contentRect.width });
                    }
                }
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chart) {
                chart.remove();
            }
        };
    }, [stats]);

    return (
        <Box
            bg="glass.100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="border.glass"
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="bold" color="white">Account Analysis</Text>
                <Flex gap={2} align="center">
                    <Text color="gray.300" fontSize="sm">Last (Days):</Text>
                    <Input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        width="80px"
                        size="sm"
                        bg="glass.200"
                        color="white"
                    />
                    <Button size="sm" onClick={loadStats} loading={loading} colorPalette="teal">Refresh</Button>
                </Flex>
            </Flex>

            {loading && !stats ? (
                <Flex justify="center" py={20}>
                    <Spinner size="xl" color="teal.500" />
                </Flex>
            ) : stats ? (
                <Box>
                    {/* Summary Cards */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
                        <StatCard label="Total Profit" value={stats.total_profit} isCurrency />
                        <StatCard label="Win Rate" value={`${stats.win_rate}%`} color={stats.win_rate >= 50 ? "green.400" : "red.400"} />
                        <StatCard label="Profit Factor" value={stats.profit_factor} />
                        <StatCard label="Max Drawdown" value={stats.max_drawdown} isCurrency color="red.400" />
                    </SimpleGrid>

                    {/* Equity Curve */}
                    <Box mb={8} bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                        <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Equity Curve</Text>
                        <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
                    </Box>

                    {/* Monthly PnL */}
                    <Box bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                        <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Monthly PnL</Text>
                        <Flex gap={4} wrap="wrap">
                            {stats.monthly_pnl.map((m: any) => (
                                <Box key={m.month} textAlign="center">
                                    <Box
                                        height="100px"
                                        width="40px"
                                        bg="glass.200"
                                        position="relative"
                                        borderRadius="sm"
                                        overflow="hidden"
                                    >
                                        <Box
                                            position="absolute"
                                            bottom={m.profit >= 0 ? "0" : "auto"}
                                            top={m.profit < 0 ? "0" : "auto"}
                                            left="0"
                                            right="0"
                                            height={`${Math.min(Math.abs(m.profit) / 100, 100)}%`} // Simple scaling
                                            bg={m.profit >= 0 ? "green.400" : "red.400"}
                                        />
                                    </Box>
                                    <Text fontSize="xs" color="gray.400" mt={1}>{m.month}</Text>
                                    <Text fontSize="xs" fontWeight="bold" color={m.profit >= 0 ? "green.400" : "red.400"}>
                                        {m.profit}
                                    </Text>
                                </Box>
                            ))}
                        </Flex>
                    </Box>
                </Box>
            ) : (
                <Text color="gray.400" textAlign="center">No data available</Text>
            )}
        </Box>
    );
};

const StatCard = ({ label, value, isCurrency = false, color = "white" }: any) => (
    <Box bg="glass.200" p={4} borderRadius="md" textAlign="center">
        <Text fontSize="sm" color="gray.400" mb={1}>{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color={color}>
            {isCurrency && Number(value) >= 0 ? '+' : ''}{value}
        </Text>
    </Box>
);
