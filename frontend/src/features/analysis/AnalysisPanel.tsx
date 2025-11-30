import { Box, Flex, Text, Spinner, Input, Button } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { listData, loadData } from '../../lib/api';
import type { DataFile } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

// Define API function for indicators here temporarily or move to api.ts
const fetchIndicators = async (symbol: string, timeframe: string, indicators: any[], startDate?: string, endDate?: string) => {
    const response = await fetch('/api/analysis/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, indicators, start_date: startDate, end_date: endDate })
    });
    if (!response.ok) throw new Error('Failed to fetch indicators');
    return response.json();
};

export const AnalysisPanel = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const indicatorSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);

    const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Date filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Indicator states
    const [showSMA, setShowSMA] = useState(false);
    const [showBB, setShowBB] = useState(false);

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const files = await listData();
                setDataFiles(files);
                if (files.length > 0) {
                    setSelectedFile(files[0].filename);
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadFiles();
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#333' },
                horzLines: { color: '#333' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    const loadChartData = async () => {
        if (!selectedFile || !chartRef.current || !candlestickSeriesRef.current) return;

        setLoading(true);
        try {
            const file = dataFiles.find(f => f.filename === selectedFile);
            if (!file) return;

            const data = await loadData(file.symbol, file.timeframe, startDate, endDate);

            // Format data for lightweight-charts
            const chartData = data.map((d: any) => ({
                time: new Date(d.time).getTime() / 1000 as any, // Cast to any to satisfy Time type
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));

            candlestickSeriesRef.current?.setData(chartData);

            // Load Indicators
            const indicators = [];
            if (showSMA) indicators.push({ name: 'SMA', params: { period: 20 } });
            if (showBB) indicators.push({ name: 'BB', params: { period: 20, std_dev: 2 } });

            // Clear previous indicators
            if (chartRef.current) {
                indicatorSeriesRefs.current.forEach(s => (chartRef.current as any).removeSeries(s));
            }
            indicatorSeriesRefs.current = [];

            if (indicators.length > 0) {
                // For indicators, we also need to pass the date range if the backend supports it, 
                // but currently fetchIndicators might calculate on the full loaded data or re-load.
                // The current fetchIndicators implementation in this file calls /api/analysis/indicators
                // which calls data_manager.load_data again. So we should update fetchIndicators to pass dates too?
                // The fetchIndicators function defined at top of file takes (symbol, timeframe, indicators).
                // It doesn't take dates. We should update it or the backend might load full data.
                // However, let's just update the chart data first.
                // Ideally we should update fetchIndicators signature too, but let's stick to the plan.
                // Actually, if we filter the chart data, the indicators returned for the FULL data might not match if we don't filter them too.
                // But let's assume for now we just want to filter the main chart.
                // Wait, if I filter the main chart, I MUST filter the indicators too or they will be out of sync.
                // The backend /api/analysis/indicators endpoint accepts start_date and end_date.
                // So I should update fetchIndicators to accept them.

                // Let's update the fetchIndicators call here to pass dates if I update the function.
                // For now, I'll just call it as is, but I should probably update it.
                // Let's update the fetchIndicators function at the top of the file in a separate step if needed.
                // For this chunk, I'll just use the existing one, but wait...
                // If I don't pass dates to indicators, they will be calculated on default range (30 days or whatever).
                // My loadData call uses startDate/endDate.
                // So I really should pass them.

                // Let's update the fetchIndicators call to include startDate and endDate in the body?
                // The fetchIndicators function at line 10 takes (symbol, timeframe, indicators).
                // I can't easily change it in this chunk without changing line 10.
                // I will update the fetchIndicators call to pass an object with dates if I can, or just update the function later.
                // Let's just stick to the plan of updating loadChartData first.

                const indResults = await fetchIndicators(file.symbol, file.timeframe, indicators, startDate, endDate);

                if (showSMA && indResults['SMA_20']) {
                    const smaSeries = chartRef.current.addSeries(LineSeries, { color: 'yellow', lineWidth: 1 });
                    const smaData = indResults['SMA_20'].map((val: number, i: number) => ({
                        time: chartData[i].time,
                        value: val
                    }));
                    smaSeries.setData(smaData);
                    indicatorSeriesRefs.current.push(smaSeries);
                }

                if (showBB && indResults['BB_20_2']) {
                    const bbData = indResults['BB_20_2'];
                    const upperSeries = chartRef.current.addSeries(LineSeries, { color: 'rgba(0, 150, 136, 0.5)', lineWidth: 1 });
                    const lowerSeries = chartRef.current.addSeries(LineSeries, { color: 'rgba(0, 150, 136, 0.5)', lineWidth: 1 });

                    upperSeries.setData(bbData.map((d: any, i: number) => ({ time: chartData[i].time, value: d.upper })));
                    lowerSeries.setData(bbData.map((d: any, i: number) => ({ time: chartData[i].time, value: d.lower })));

                    indicatorSeriesRefs.current.push(upperSeries, lowerSeries);
                }
            }

            chartRef.current?.timeScale().fitContent();

        } catch (error) {
            console.error('Failed to load chart data:', error);
            toaster.create({
                title: 'Error',
                description: 'Failed to load chart data',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChartData();
    }, [selectedFile, showSMA, showBB, dataFiles]);

    return (
        <Box
            bg="glass.100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="border.glass"
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            height="100%"
        >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">Market Analysis</Text>
                <Flex gap={4} align="center">
                    <Flex gap={2} align="center">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            bg="rgba(255, 255, 255, 0.1)"
                            color="white"
                            border="1px solid rgba(255, 255, 255, 0.1)"
                            size="sm"
                            width="130px"
                        />
                        <Text color="gray.400">-</Text>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            bg="rgba(255, 255, 255, 0.1)"
                            color="white"
                            border="1px solid rgba(255, 255, 255, 0.1)"
                            size="sm"
                            width="130px"
                        />
                        <Button
                            onClick={loadChartData}
                            size="sm"
                            bg="teal.600"
                            color="white"
                            _hover={{ bg: "teal.700" }}
                            isLoading={loading}
                        >
                            Load
                        </Button>
                    </Flex>

                    <select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '14px',
                            height: '32px',
                            width: '200px'
                        }}
                    >
                        <option value="" style={{ color: 'black' }}>Select Data</option>
                        {dataFiles.map(f => (
                            <option key={f.filename} value={f.filename} style={{ color: 'black' }}>
                                {f.symbol} ({f.timeframe})
                            </option>
                        ))}
                    </select>

                    <Flex gap={4} bg="rgba(0,0,0,0.2)" p={2} borderRadius="md" align="center">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showSMA}
                                onChange={(e) => setShowSMA(e.target.checked)}
                            />
                            SMA (20)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showBB}
                                onChange={(e) => setShowBB(e.target.checked)}
                            />
                            Bollinger Bands
                        </label>
                    </Flex>
                </Flex>
            </Flex>

            <Box
                ref={chartContainerRef}
                width="100%"
                height="500px"
                bg="black"
                borderRadius="md"
                position="relative"
            >
                {loading && (
                    <Flex
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        justify="center"
                        align="center"
                        bg="rgba(0,0,0,0.5)"
                        zIndex="1"
                    >
                        <Spinner color="teal.500" size="xl" />
                    </Flex>
                )}
            </Box>
        </Box>
    );
};
