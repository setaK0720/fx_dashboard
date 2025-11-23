import { Box, Button, Heading, Input, Stack, Text, SimpleGrid, Stat, NativeSelect } from '@chakra-ui/react';
import { useState } from 'react';
import { runBacktest } from '../../lib/api';
import type { BacktestRequest, BacktestResponse } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export const BacktestPanel = () => {
    const [symbol, setSymbol] = useState('USD/JPY');
    const [timeframe, setTimeframe] = useState('M1');
    const [periodDays, setPeriodDays] = useState('30');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BacktestResponse | null>(null);

    const handleRun = async () => {
        setIsLoading(true);
        try {
            const request: BacktestRequest = {
                symbol,
                timeframe,
                period_days: parseInt(periodDays),
                initial_cash: 1000000,
                short_window: 10,
                long_window: 20
            };
            const data = await runBacktest(request);
            setResult(data);
        } catch (error) {
            alert('Backtest Failed');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>Backtest</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={4}>
                <Box>
                    <Text fontSize="sm" mb={1}>Symbol</Text>
                    <NativeSelect.Root size="sm" variant="outline">
                        <NativeSelect.Field value={symbol} onChange={(e) => setSymbol(e.target.value)} bg="gray.700" borderColor="gray.600">
                            <option value="USD/JPY">USD/JPY</option>
                            <option value="EUR/USD">EUR/USD</option>
                            <option value="GBP/USD">GBP/USD</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Timeframe</Text>
                    <NativeSelect.Root size="sm" variant="outline">
                        <NativeSelect.Field value={timeframe} onChange={(e) => setTimeframe(e.target.value)} bg="gray.700" borderColor="gray.600">
                            <option value="M1">M1</option>
                            <option value="M5">M5</option>
                            <option value="H1">H1</option>
                            <option value="D1">D1</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Period (Days)</Text>
                    <Input
                        type="number"
                        value={periodDays}
                        onChange={(e) => setPeriodDays(e.target.value)}
                        bg="gray.700"
                        borderColor="gray.600"
                        size="sm"
                    />
                </Box>
            </SimpleGrid>

            <Button colorPalette="teal" loading={isLoading} onClick={handleRun} width="full" mb={6}>
                Run Backtest
            </Button>

            {result && (
                <Stack gap={6}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                        <Stat.Root>
                            <Stat.Label>Return</Stat.Label>
                            <Stat.ValueText color={result.return_pct >= 0 ? "green.400" : "red.400"}>
                                {result.return_pct.toFixed(2)}%
                            </Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label>Win Rate</Stat.Label>
                            <Stat.ValueText>{result.win_rate.toFixed(2)}%</Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label>Profit Factor</Stat.Label>
                            <Stat.ValueText>{result.profit_factor.toFixed(2)}</Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label>Trades</Stat.Label>
                            <Stat.ValueText>{result.trades}</Stat.ValueText>
                        </Stat.Root>
                    </SimpleGrid>

                    <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equity_curve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 12 }} minTickGap={30} />
                                <YAxis stroke="#888" domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="equity" stroke="#4FD1C5" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Stack>
            )}
        </Box>
    );
};
