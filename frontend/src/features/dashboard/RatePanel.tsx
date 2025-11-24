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
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)" position="relative" zIndex={10}>
            <Heading size="sm" mb={2} color="text.main">ライブレート {isConnected ? '(接続中)' : '(切断時)'}</Heading>

            <Menu.Root>
                <Menu.Trigger asChild>
                    <Button
                        variant="outline"
                        width="200px"
                        justifyContent="space-between"
                        bg="glass.100"
                        color="text.main"
                        borderColor="border.glass"
                        _hover={{ bg: "glass.200", borderColor: "violet.500" }}
                        size="sm"
                    >
                        {selectedSymbol} <Box as="span">▼</Box>
                    </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                    <Menu.Content bg="bg.panel" borderColor="border.glass" minW="200px" zIndex={1000} backdropFilter="blur(10px)">
                        {AVAILABLE_SYMBOLS.map(symbol => (
                            <Menu.Item
                                key={symbol}
                                value={symbol}
                                onClick={() => onSymbolChange(symbol)}
                                bg="transparent"
                                color="text.main"
                                _hover={{ bg: "glass.200" }}
                                cursor="pointer"
                                p={2}
                            >
                                {symbol}
                            </Menu.Item>
                        ))}
                    </Menu.Content>
                </Menu.Positioner>
            </Menu.Root>

            <Box p={2} bg="glass.100" borderRadius="md" mt={2} border="1px solid" borderColor="border.glass">
                <Stat.Root>
                    <Stat.Label fontSize="md" fontWeight="bold" color="text.main">{selectedSymbol}</Stat.Label>
                    <HStack justify="space-between" mt={1}>
                        <Box>
                            <Stat.Label fontSize="xs" color="text.muted">Bid</Stat.Label>
                            <Stat.ValueText fontSize="lg" color="red.300">
                                {data?.bid?.toFixed(selectedSymbol.includes("JPY") ? 3 : 5) || '---'}
                            </Stat.ValueText>
                        </Box>
                        <Box>
                            <Stat.Label fontSize="xs" color="text.muted">Ask</Stat.Label>
                            <Stat.ValueText fontSize="lg" color="blue.300">
                                {data?.ask?.toFixed(selectedSymbol.includes("JPY") ? 3 : 5) || '---'}
                            </Stat.ValueText>
                        </Box>
                    </HStack>
                    <HStack justify="flex-end" mt={0}>
                        <Stat.HelpText fontSize="xs" color="text.muted">Spread: {data?.spread ?? '-'}</Stat.HelpText>
                    </HStack>
                </Stat.Root>
            </Box>
        </Box>
    );
};
