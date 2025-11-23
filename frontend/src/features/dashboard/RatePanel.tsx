import { Box, Heading, Stat, HStack } from '@chakra-ui/react';
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

            <HStack gap={4} mb={6}>
                <select
                    value={selectedSymbol}
                    onChange={(e) => onSymbolChange(e.target.value)}
                    style={{
                        width: '200px',
                        padding: '8px',
                        borderRadius: '4px',
                        background: '#2D3748',
                        color: 'white',
                        border: '1px solid #4A5568'
                    }}
                >
                    {AVAILABLE_SYMBOLS.map(symbol => (
                        <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                </select>
            </HStack>

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
