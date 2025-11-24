import { Box, Table, Text, Badge, Button, Flex, HStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { fetchPositions, closePosition, closeAllPositions } from '../../lib/api';
import type { Position } from '../../lib/api';

export const PositionTable = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [now, setNow] = useState(Date.now());

    const loadPositions = async () => {
        try {
            const data = await fetchPositions();
            setPositions(data);
        } catch (error) {
            console.error('Failed to load positions:', error);
        }
    };

    // Initial load
    useEffect(() => {
        loadPositions();
        const interval = setInterval(loadPositions, 5000); // Polling fallback

        // Update elapsed time every second
        const timer = setInterval(() => setNow(Date.now()), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

    const handleClose = async (ticket: number) => {
        if (!confirm(`Are you sure you want to close position ${ticket}?`)) return;
        try {
            await closePosition(ticket);
            loadPositions(); // Reload after close
        } catch (error) {
            console.error('Failed to close position:', error);
            alert('Failed to close position');
        }
    };

    const handleBulkClose = async (type: 'BUY' | 'SELL' | 'ALL') => {
        const message = type === 'ALL'
            ? 'Are you sure you want to close ALL positions?'
            : `Are you sure you want to close all ${type} positions?`;

        if (!confirm(message)) return;

        setLoading(true);
        try {
            await closeAllPositions(type);
            loadPositions();
        } catch (error) {
            console.error('Failed to close positions:', error);
            alert('Failed to close positions');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: number) => {
        // timestamp is Unix time in seconds from MT5
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

    const formatElapsed = (timestamp: number) => {
        // Both now and timestamp should be in seconds
        const currentTimeSeconds = Math.floor(now / 1000);
        const diff = currentTimeSeconds - timestamp;

        // If diff is negative or unreasonably large, something is wrong
        if (diff < 0 || diff > 86400 * 365) {
            return '0s';
        }

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
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
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">Open Positions</Text>
                <HStack>
                    <Button
                        size="sm"
                        bg="blue.700"
                        color="white"
                        _hover={{ bg: "blue.800" }}
                        onClick={() => handleBulkClose('BUY')}
                        disabled={loading || !positions.some(p => p.type === 'BUY')}
                    >
                        CLOSE BUY
                    </Button>
                    <Button
                        size="sm"
                        bg="red.700"
                        color="white"
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{formatElapsed(pos.time)}</Table.Cell>
                    <Table.Cell fontWeight="bold" color="text.main" borderBottomColor="border.glass">{pos.symbol}</Table.Cell>
                    <Table.Cell borderBottomColor="border.glass">
                        <Badge colorPalette={pos.type === 'BUY' ? 'blue' : 'red'} variant="solid" size="sm">{pos.type}</Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{pos.volume}</Table.Cell>
                    <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{pos.open_price}</Table.Cell>
                    <Table.Cell textAlign="right" color={pos.profit >= 0 ? 'green.300' : 'red.300'} borderBottomColor="border.glass">
                        {pos.profit}
                    </Table.Cell>
                    <Table.Cell textAlign="center" borderBottomColor="border.glass">
                        <Button
                            size="xs"
                            bg="red.600"
                            color="white"
                            _hover={{ bg: "red.700" }}
                            onClick={() => handleClose(pos.id)}
                        >
                            Close
                        </Button>
                    </Table.Cell>
                </Table.Row>
                        ))}
            </Table.Body>
        </Table.Root>
            </Box >
        </Box >
    );
};
