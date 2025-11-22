import { Box, Text } from '@chakra-ui/react';
import { usePrices } from '../../hooks/usePrices';

export const RatePanel = () => {
    const { lastMessage, isConnected } = usePrices();

    return (
        <Box mb={6}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Live Rates {isConnected ? '(Connected)' : '(Disconnected)'}
            </Text>
            <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
                <Text>{lastMessage || 'Waiting for price updates...'}</Text>
            </Box>
        </Box>
    );
};


