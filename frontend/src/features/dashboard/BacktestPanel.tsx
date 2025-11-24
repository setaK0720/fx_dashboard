import { Box, Button, Heading, Input, Stack, Text, SimpleGrid, Stat, NativeSelect } from '@chakra-ui/react';
import { useState } from 'react';
import { runBacktest } from '../../lib/api';
import type { BacktestRequest, BacktestResponse } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BacktestPanel = () => {
    const [symbol, setSymbol] = useState('BTCUSD');
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
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Heading size="sm" mb={2} color="text.main">Backtest</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={2} mb={4}>
                <Box>
                    <Text fontSize="xs" mb={1} color="text.muted">Symbol</Text>
                    <NativeSelect.Root size="sm" variant="outline">
                        <NativeSelect.Field value={symbol} onChange={(e) => setSymbol(e.target.value)} bg="glass.100" borderColor="border.glass" color="text.main">
                            <option value="BTCUSD" style={{ color: "black" }}>BTCUSD</option>
                            <option value="USDJPY" style={{ color: "black" }}>USDJPY</option>
                            <option value="EURUSD" style={{ color: "black" }}>EURUSD</option>
                            <option value="GBPUSD" style={{ color: "black" }}>GBPUSD</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator color="text.muted" />
                    </NativeSelect.Root>
                </Box>
                <Box>
                    <Text fontSize="xs" mb={1} color="text.muted">Timeframe</Text>
                    <NativeSelect.Root size="sm" variant="outline">
                        <NativeSelect.Field value={timeframe} onChange={(e) => setTimeframe(e.target.value)} bg="glass.100" borderColor="border.glass" color="text.main">
                            <option value="M1" style={{ color: "black" }}>M1</option>
                            <option value="M5" style={{ color: "black" }}>M5</option>
                            <option value="H1" style={{ color: "black" }}>H1</option>
                            <option value="D1" style={{ color: "black" }}>D1</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator color="text.muted" />
                    </NativeSelect.Root>
                </Box>
                <Box>
                    <Text fontSize="xs" mb={1} color="text.muted">Period (Days)</Text>
                    <Input
                        type="number"
                        value={periodDays}
                        onChange={(e) => setPeriodDays(e.target.value)}
                        bg="glass.100"
                        borderColor="border.glass"
                        color="text.main"
                        size="sm"
                        _focus={{ borderColor: "violet.500", boxShadow: "0 0 0 1px #8a2be2" }}
                    />
                </Box>
            </SimpleGrid>

            <Button
                bg="violet.500"
                color="white"
                loading={isLoading}
                onClick={handleRun}
                width="full"
                mb={4}
                size="sm"
                _hover={{ bg: "violet.600", boxShadow: "0 0 10px #8a2be2" }}
            >
                Run Backtest
            </Button>

            {result && (
                <Stack gap={4}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={2}>
                        <Stat.Root>
                            <Stat.Label color="text.muted" fontSize="xs">Return</Stat.Label>
                            <Stat.ValueText color={result.return_pct >= 0 ? "green.400" : "red.400"} fontSize="md">
                                {result.return_pct.toFixed(2)}%
                            </Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label color="text.muted" fontSize="xs">Win Rate</Stat.Label>
                            <Stat.ValueText color="text.main" fontSize="md">{result.win_rate.toFixed(2)}%</Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label color="text.muted" fontSize="xs">Profit Factor</Stat.Label>
                            <Stat.ValueText color="text.main" fontSize="md">{result.profit_factor.toFixed(2)}</Stat.ValueText>
                        </Stat.Root>
                        <Stat.Root>
                            <Stat.Label color="text.muted" fontSize="xs">Trades</Stat.Label>
                            <Stat.ValueText color="text.main" fontSize="md">{result.trades}</Stat.ValueText>
                        </Stat.Root>
                    </SimpleGrid>

                    <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equity_curve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                                <XAxis dataKey="time" stroke="#a0a0a0" tick={{ fontSize: 12 }} minTickGap={30} tickLine={false} />
                                <YAxis stroke="#a0a0a0" domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(20, 10, 30, 0.9)', borderColor: 'rgba(138, 43, 226, 0.3)', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="equity" stroke="#00ffff" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Stack>
            )}
        </Box>
    );
};
