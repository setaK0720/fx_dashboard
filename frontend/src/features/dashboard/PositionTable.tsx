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
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Open Positions</Text>
            <Box overflowX="auto">
                <Table.Root variant="outline" size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader color="gray.400">Time</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400">Elapsed</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400">Symbol</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400">Type</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Lot</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Price</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Profit</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {positions.map((pos) => (
                            <Table.Row key={pos.id}>
                                <Table.Cell>{formatTime(pos.time)}</Table.Cell>
                                <Table.Cell>{formatElapsed(pos.time)}</Table.Cell>
                                <Table.Cell fontWeight="bold">{pos.symbol}</Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette={pos.type === 'BUY' ? 'blue' : 'red'}>{pos.type}</Badge>
                                </Table.Cell>
                                <Table.Cell textAlign="right">{pos.volume}</Table.Cell>
                                <Table.Cell textAlign="right">{pos.open_price}</Table.Cell>
                                <Table.Cell textAlign="right" color={pos.profit >= 0 ? 'green.300' : 'red.300'}>
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
