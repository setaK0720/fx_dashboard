import { Box, Heading, SimpleGrid, Stat, HStack, Checkbox, Stack } from '@chakra-ui/react';
import { usePrices } from '../../hooks/usePrices';
import { useState } from 'react';

const AVAILABLE_SYMBOLS = ["BTCUSD", "USDJPY", "EURUSD"];

export const RatePanel = () => {
    const { prices, isConnected } = usePrices();
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["BTCUSD", "USDJPY"]);

    const toggleSymbol = (symbol: string) => {
        if (selectedSymbols.includes(symbol)) {
            setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
        } else {
            setSelectedSymbols([...selectedSymbols, symbol]);
        }
    };

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>Live Rates {isConnected ? '(Connected)' : '(Disconnected)'}</Heading>

            <HStack gap={4} mb={6}>
                {AVAILABLE_SYMBOLS.map(symbol => (
                    <Checkbox.Root
                        key={symbol}
                        checked={selectedSymbols.includes(symbol)}
                        onCheckedChange={() => toggleSymbol(symbol)}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>{symbol}</Checkbox.Label>
                    </Checkbox.Root>
                ))}
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {selectedSymbols.map(symbol => {
                    const data = prices[symbol];
                    return (
                        <Box key={symbol} p={3} bg="gray.700" borderRadius="md">
                            <Stat.Root>
                                <Stat.Label fontSize="lg" fontWeight="bold">{symbol}</Stat.Label>
                                <HStack justify="space-between" mt={2}>
                                    <Box>
                                        <Stat.Label fontSize="xs">Bid</Stat.Label>
                                        <Stat.ValueText fontSize="xl" color="red.300">
                                            {data?.bid?.toFixed(symbol.includes("JPY") ? 3 : 5) || '---'}
                                        </Stat.ValueText>
                                    </Box>
                                    <Box>
                                        <Stat.Label fontSize="xs">Ask</Stat.Label>
                                        <Stat.ValueText fontSize="xl" color="blue.300">
                                            {data?.ask?.toFixed(symbol.includes("JPY") ? 3 : 5) || '---'}
                                        </Stat.ValueText>
                                    </Box>
                                </HStack>
                                <HStack justify="flex-end" mt={1}>
                                    <Stat.HelpText fontSize="sm">Spread: {data?.spread ?? '-'}</Stat.HelpText>
                                </HStack>
                            </Stat.Root>
                        </Box>
                    );
                })}
            </SimpleGrid>
        </Box>
    );
};
