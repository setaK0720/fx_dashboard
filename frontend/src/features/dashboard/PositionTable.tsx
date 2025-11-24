import { Box, Table, Text, Badge } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { fetchPositions } from '../../lib/api';
import type { Position } from '../../lib/api';

export const PositionTable = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const fetch = () => fetchPositions().then(setPositions).catch(console.error);
        fetch();
        const interval = setInterval(fetch, 5000);

        // Update elapsed time every second
        const timer = setInterval(() => setNow(Date.now()), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

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
        const currentTimeSeconds = Math.floor(Date.now() / 1000);
        const diff = currentTimeSeconds - timestamp;

        // If diff is negative or unreasonably large, something is wrong
        if (diff < 0 || diff > 86400 * 365) {
            console.warn('Invalid time diff:', { currentTimeSeconds, timestamp, diff });
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
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Text fontSize="md" fontWeight="bold" mb={2} color="text.main">Open Positions</Text>
            <Box overflowX="auto">
                <Table.Root variant="line" size="sm">
                    <Table.Header>
                        <Table.Row borderBottomColor="border.glass">
                            <Table.ColumnHeader color="text.muted" fontSize="xs" borderBottomColor="border.glass">Time</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" borderBottomColor="border.glass">Elapsed</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" borderBottomColor="border.glass">Symbol</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" borderBottomColor="border.glass">Type</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" textAlign="right" borderBottomColor="border.glass">Lot</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" textAlign="right" borderBottomColor="border.glass">Price</Table.ColumnHeader>
                            <Table.ColumnHeader color="text.muted" fontSize="xs" textAlign="right" borderBottomColor="border.glass">Profit</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {positions.map((pos) => (
                            <Table.Row key={pos.id} bg="transparent" borderBottomColor="border.glass" _hover={{ bg: "glass.100" }}>
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{formatTime(pos.time)}</Table.Cell>
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
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Box>
    );
};
