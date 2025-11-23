import { Box, Button, Flex, Heading, Input, Stack, Text, NativeSelect } from '@chakra-ui/react';
import { useState } from 'react';
import { placeOrder } from '../../lib/api';

export const OrderForm = () => {
    const [symbol, setSymbol] = useState('USD/JPY');
    const [orderType, setOrderType] = useState('BUY');
    const [volume, setVolume] = useState('0.1');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await placeOrder({
                symbol: symbol,
                order_type: orderType as 'BUY' | 'SELL',
                volume: parseFloat(volume),
            });
            alert(`Order Placed: ${orderType} ${symbol} ${volume} lots`);
        } catch (error) {
            alert('Order Failed: Failed to place order.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>New Order</Heading>
            <Stack gap={4}>
                <Box>
                    <Text mb={2} fontSize="sm">Symbol</Text>
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
                    <Text mb={2} fontSize="sm">Type</Text>
                    <Flex gap={4}>
                        <Button
                            size="sm"
                            flex={1}
                            colorPalette={orderType === 'BUY' ? 'blue' : 'gray'}
                            variant={orderType === 'BUY' ? 'solid' : 'outline'}
                            onClick={() => setOrderType('BUY')}
                        >
                            Buy
                        </Button>
                        <Button
                            size="sm"
                            flex={1}
                            colorPalette={orderType === 'SELL' ? 'red' : 'gray'}
                            variant={orderType === 'SELL' ? 'solid' : 'outline'}
                            onClick={() => setOrderType('SELL')}
                        >
                            Sell
                        </Button>
                    </Flex>
                </Box>

                <Box>
                    <Text mb={2} fontSize="sm">Volume</Text>
                    <Input
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        min={0.01}
                        step={0.01}
                        bg="gray.700"
                        borderColor="gray.600"
                    />
                </Box>

                <Button colorPalette={orderType === 'BUY' ? 'blue' : 'red'} loading={isLoading} onClick={handleSubmit} width="full">
                    Place {orderType} Order
                </Button>
            </Stack>
        </Box>
    );
};
