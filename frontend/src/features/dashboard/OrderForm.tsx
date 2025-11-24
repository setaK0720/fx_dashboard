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
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Heading size="sm" mb={2} color="text.main">New Order</Heading>
            <form onSubmit={handleSubmit}>
                <Stack gap={2}>
                    <Box>
                        <Text mb={1} fontSize="xs" color="text.muted">Symbol</Text>
                        <Menu.Root>
                            <Menu.Trigger asChild>
                                <Button
                                    variant="outline"
                                    width="full"
                                    justifyContent="space-between"
                                    bg="glass.100"
                                    borderColor="border.glass"
                                    color="text.main"
                                    _hover={{ bg: "glass.200", borderColor: "violet.500" }}
                                    size="sm"
                                >
                                    {symbol} <Box as="span">▼</Box>
                                </Button>
                            </Menu.Trigger>
                            <Menu.Positioner>
                                <Menu.Content bg="bg.panel" borderColor="border.glass" minW="content" zIndex={1000} backdropFilter="blur(10px)">
                                    {["BTCUSD", "USDJPY", "EURUSD", "GBPUSD", "XAUUSD"].map((s) => (
                                        <Menu.Item
                                            key={s}
                                            value={s}
                                            onClick={() => setSymbol(s)}
                                            bg="transparent"
                                            color="text.main"
                                            _hover={{ bg: "glass.200" }}
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
                        <Text mb={1} fontSize="xs" color="text.muted">Type</Text>
                        <Flex gap={2}>
                            <Button
                                size="sm"
                                flex={1}
                                bg={orderType === 'BUY' ? 'blue.500' : 'transparent'}
                                borderColor={orderType === 'BUY' ? 'blue.500' : 'border.glass'}
                                color="white"
                                variant={orderType === 'BUY' ? 'solid' : 'outline'}
                                onClick={() => setOrderType('BUY')}
                                type="button"
                                _hover={{ bg: orderType === 'BUY' ? 'blue.600' : 'glass.200' }}
                            >
                                Buy
                            </Button>
                            <Button
                                size="sm"
                                flex={1}
                                bg={orderType === 'SELL' ? 'red.500' : 'transparent'}
                                borderColor={orderType === 'SELL' ? 'red.500' : 'border.glass'}
                                color="white"
                                variant={orderType === 'SELL' ? 'solid' : 'outline'}
                                onClick={() => setOrderType('SELL')}
                                type="button"
                                _hover={{ bg: orderType === 'SELL' ? 'red.600' : 'glass.200' }}
                            >
                                Sell
                            </Button>
                        </Flex>
                    </Box>

                    <Box>
                        <Text mb={1} fontSize="xs" color="text.muted">Volume</Text>
                        <Input
                            type="number"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            min={0.01}
                            step={0.01}
                            bg="glass.100"
                            borderColor="border.glass"
                            color="text.main"
                            size="sm"
                            _focus={{ borderColor: "violet.500", boxShadow: "0 0 0 1px #8a2be2" }}
                        />
                    </Box>

                    <Button
                        bg={orderType === 'BUY' ? 'blue.500' : 'red.500'}
                        color="white"
                        loading={isLoading}
                        type="submit"
                        width="full"
                        size="sm"
                        _hover={{ opacity: 0.9, boxShadow: orderType === 'BUY' ? "0 0 10px blue" : "0 0 10px red" }}
                    >
                        Place {orderType} Order
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
