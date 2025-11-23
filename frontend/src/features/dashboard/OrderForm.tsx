import { Box, Button, Flex, Heading, Input, Stack, Text, Menu } from '@chakra-ui/react';
import { useState } from 'react';
import { placeOrder } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

export const OrderForm = () => {
    const [symbol, setSymbol] = useState('BTCUSD');
    const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
    const [volume, setVolume] = useState('0.01');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await placeOrder({ symbol, order_type: orderType, volume: parseFloat(volume) });
            toaster.create({
                title: 'Order placed',
                description: `${orderType} ${volume} ${symbol}`,
                type: 'success',
            });
        } catch (error) {
            toaster.create({
                title: 'Order failed',
                description: 'Failed to place order',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>New Order</Heading>
            <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                    <Box>
                        <Text mb={1}>Symbol</Text>
                        <Menu.Root>
                            <Menu.Trigger asChild>
                                <Button
                                    variant="outline"
                                    width="full"
                                    justifyContent="space-between"
                                    bg="gray.700"
                                    borderColor="gray.600"
                                    color="white"
                                    _hover={{ bg: "gray.600" }}
                                >
                                    {symbol} <Box as="span">▼</Box>
                                </Button>
                            </Menu.Trigger>
                            <Menu.Positioner>
                                <Menu.Content bg="gray.700" borderColor="gray.600" minW="content" zIndex={1000}>
                                    {["BTCUSD", "USDJPY", "EURUSD", "GBPUSD", "XAUUSD"].map((s) => (
                                        <Menu.Item
                                            key={s}
                                            value={s}
                                            onClick={() => setSymbol(s)}
                                            bg="gray.700"
                                            color="white"
                                            _hover={{ bg: "gray.600" }}
                                            cursor="pointer"
                                            p={2}
                                        >
                                            {s}
                                        </Menu.Item>
                                    ))}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Menu.Root>
                    </Box>

                    <Box>
                        <Text mb={1}>Type</Text>
                        <Flex gap={4}>
                            <Button
                                size="sm"
                                flex={1}
                                colorPalette={orderType === 'BUY' ? 'blue' : 'gray'}
                                variant={orderType === 'BUY' ? 'solid' : 'outline'}
                                onClick={() => setOrderType('BUY')}
                                type="button"
                            >
                                Buy
                            </Button>
                            <Button
                                size="sm"
                                flex={1}
                                colorPalette={orderType === 'SELL' ? 'red' : 'gray'}
                                variant={orderType === 'SELL' ? 'solid' : 'outline'}
                                onClick={() => setOrderType('SELL')}
                                type="button"
                            >
                                Sell
                            </Button>
                        </Flex>
                    </Box>

                    <Box>
                        <Text mb={1}>Volume</Text>
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

                    <Button colorPalette={orderType === 'BUY' ? 'blue' : 'red'} loading={isLoading} type="submit" width="full">
                        Place {orderType} Order
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
