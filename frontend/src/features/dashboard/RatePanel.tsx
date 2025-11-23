import { Box, Heading, SimpleGrid, Stat } from '@chakra-ui/react';
import { usePrices } from '../../hooks/usePrices';

export const RatePanel = () => {
    const { prices, isConnected } = usePrices();

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>Live Rates {isConnected ? '(Connected)' : '(Disconnected)'}</Heading>
            <SimpleGrid columns={2} gap={4}>
                <Stat.Root>
                    <Stat.Label>BTCUSD</Stat.Label>
                    <Stat.ValueText>{prices['BTCUSD']?.toFixed(2) || '---'}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                    <Stat.Label>USDJPY</Stat.Label>
                    <Stat.ValueText>{prices['USDJPY']?.toFixed(3) || '---'}</Stat.ValueText>
                </Stat.Root>
            </SimpleGrid>
        </Box>
    );
};
