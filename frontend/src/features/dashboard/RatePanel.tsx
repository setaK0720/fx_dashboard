import { Box, Heading, Stat, HStack, Menu, Button } from '@chakra-ui/react';
import { usePrices } from '../../hooks/usePrices';

const AVAILABLE_SYMBOLS = ["BTCUSD", "USDJPY", "EURUSD", "XAUUSD"];

interface RatePanelProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
}

export const RatePanel = ({ selectedSymbol, onSymbolChange }: RatePanelProps) => {
    const { prices, isConnected } = usePrices();
    const data = prices[selectedSymbol];

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>ライブレート {isConnected ? '(接続中)' : '(切断時)'}</Heading>

            <Menu.Root>
                <Menu.Trigger asChild>
                    <Button
                        variant="outline"
                        width="200px"
                        justifyContent="space-between"
                        bg="#2D3748"
                        color="white"
                        borderColor="#4A5568"
                        _hover={{ bg: "#4A5568" }}
                    >
                        {selectedSymbol} <Box as="span">▼</Box>
                    </Button>
                </Menu.Trigger>
                <Menu.Content bg="#2D3748" borderColor="#4A5568" minW="200px" zIndex={1000}>
                    {AVAILABLE_SYMBOLS.map(symbol => (
                        <Menu.Item
                            key={symbol}
                            value={symbol}
                            onClick={() => onSymbolChange(symbol)}
                            bg="#2D3748"
                            color="white"
                            _hover={{ bg: "#4A5568" }}
                            cursor="pointer"
                            p={2}
                        >
                            {symbol}
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Root>

            <Box p={3} bg="gray.700" borderRadius="md">
                <Stat.Root>
                    <Stat.Label fontSize="lg" fontWeight="bold">{selectedSymbol}</Stat.Label>
                    <HStack justify="space-between" mt={2}>
                        <Box>
                            <Stat.Label fontSize="xs">Bid</Stat.Label>
                            <Stat.ValueText fontSize="xl" color="red.300">
                                {data?.bid?.toFixed(selectedSymbol.includes("JPY") ? 3 : 5) || '---'}
                            </Stat.ValueText>
                        </Box>
                        <Box>
                            <Stat.Label fontSize="xs">Ask</Stat.Label>
                            <Stat.ValueText fontSize="xl" color="blue.300">
                                {data?.ask?.toFixed(selectedSymbol.includes("JPY") ? 3 : 5) || '---'}
                            </Stat.ValueText>
                        </Box>
                    </HStack>
                    <HStack justify="flex-end" mt={1}>
                        <Stat.HelpText fontSize="sm">Spread: {data?.spread ?? '-'}</Stat.HelpText>
                    </HStack>
                </Stat.Root>
            </Box>
        </Box>
    );
};
