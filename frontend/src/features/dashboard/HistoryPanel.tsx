import { Box, Table, Text, Badge, Flex, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { fetchHistory } from '../../lib/api';
import type { HistoryDeal } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

export const HistoryPanel = () => {
    const [deals, setDeals] = useState<HistoryDeal[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await fetchHistory(30); // Default 30 days
            setDeals(data);
        } catch (error) {
            console.error('Failed to load history:', error);
            toaster.create({
                title: 'Error',
                description: 'Failed to load history',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Box
            bg="glass.100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="border.glass"
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">Order History (Last 30 Days)</Text>
                {loading && <Spinner color="teal.500" />}
            </Flex>
            <Box overflowX="auto">
                <Table.Root variant="line" size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader color="white" fontSize="xs" bg="gray.800">Time</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" bg="gray.800">Ticket</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" bg="gray.800">Symbol</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" bg="gray.800">Type</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" bg="gray.800">Entry</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" textAlign="right" bg="gray.800">Volume</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" textAlign="right" bg="gray.800">Price</Table.ColumnHeader>
                            <Table.ColumnHeader color="white" fontSize="xs" textAlign="right" bg="gray.800">Profit</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {deals.map((deal) => (
                            <Table.Row key={deal.ticket} bg="transparent" borderBottomColor="border.glass" _hover={{ bg: "glass.100" }}>
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{formatTime(deal.time)}</Table.Cell>
                                <Table.Cell color="text.muted" borderBottomColor="border.glass">{deal.ticket}</Table.Cell>
                                <Table.Cell fontWeight="bold" color="text.main" borderBottomColor="border.glass">{deal.symbol}</Table.Cell>
                                <Table.Cell borderBottomColor="border.glass">
                                    <Badge
                                        colorPalette={deal.type === 'BUY' ? 'blue' : deal.type === 'SELL' ? 'red' : 'gray'}
                                        variant="solid"
                                        size="sm"
                                    >
                                        {deal.type}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{deal.entry}</Table.Cell>
                                <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{deal.volume}</Table.Cell>
                                <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{deal.price}</Table.Cell>
                                <Table.Cell textAlign="right" color={deal.profit >= 0 ? 'green.300' : 'red.300'} borderBottomColor="border.glass">
                                    {deal.profit}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {deals.length === 0 && !loading && (
                            <Table.Row bg="transparent">
                                <Table.Cell colSpan={8} textAlign="center" color="text.muted" py={4}>
                                    No history found
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Box>
    );
};
