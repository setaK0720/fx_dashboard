import { Box, Table, Text, Badge } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { fetchPositions } from '../../lib/api';
import type { Position } from '../../lib/api';

export const PositionTable = () => {
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        const fetch = () => fetchPositions().then(setPositions).catch(console.error);
        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Open Positions</Text>
            <Box overflowX="auto">
                <Table.Root variant="outline" size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader color="gray.400">Symbol</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400">Type</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Volume</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Open Price</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Current Price</Table.ColumnHeader>
                            <Table.ColumnHeader color="gray.400" textAlign="right">Profit</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {positions.map((pos) => (
                            <Table.Row key={pos.id}>
                                <Table.Cell>{pos.symbol}</Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette={pos.type === 'BUY' ? 'blue' : 'red'}>{pos.type}</Badge>
                                </Table.Cell>
                                <Table.Cell textAlign="right">{pos.volume}</Table.Cell>
                                <Table.Cell textAlign="right">{pos.open_price}</Table.Cell>
                                <Table.Cell textAlign="right">{pos.current_price}</Table.Cell>
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


