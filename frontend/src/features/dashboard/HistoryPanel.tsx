import { Box, Table, Text, Badge, Flex, Spinner, Input, Button } from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import { fetchHistory } from '../../lib/api';
import type { HistoryPosition } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

export const HistoryPanel = () => {
    const [positions, setPositions] = useState<HistoryPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof HistoryPosition; direction: 'asc' | 'desc' } | null>(null);
    const [filterConfig, setFilterConfig] = useState({ symbol: 'ALL', type: 'ALL' });
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const loadHistory = async () => {
        setLoading(true);
        try {
            const params = dateRange.start && dateRange.end
                ? { startDate: dateRange.start, endDate: dateRange.end }
                : { days: 30 };
            const data = await fetchHistory(params);
            setPositions(data);
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

    const uniqueSymbols = useMemo(() => {
        const symbols = new Set(positions.map(p => p.symbol));
        return Array.from(symbols).sort();
    }, [positions]);

    const handleSort = (key: keyof HistoryPosition) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredPositions = [...positions]
        .filter(pos => {
            const matchesSymbol = filterConfig.symbol === 'ALL' || pos.symbol === filterConfig.symbol;
            const matchesType = filterConfig.type === 'ALL' || pos.type === filterConfig.type;
            return matchesSymbol && matchesType;
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            // Handle null values for close_time
            const valA = a[key] ?? 0;
            const valB = b[key] ?? 0;

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    const totalProfit = sortedAndFilteredPositions.reduce((sum, pos) => sum + pos.profit, 0);
    const totalVolume = sortedAndFilteredPositions.reduce((sum, pos) => sum + pos.volume, 0);

    const formatTime = (timestamp: number | null) => {
        if (!timestamp) return '-';
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

    const SortIcon = ({ columnKey }: { columnKey: keyof HistoryPosition }) => {
        if (sortConfig?.key !== columnKey) return <Box as="span" color="gray.600" ml={1}>↕</Box>;
        return <Box as="span" color="teal.300" ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>;
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
                <Flex align="center" gap={4}>
                    <Text fontSize="xl" fontWeight="bold" color="white">Order History</Text>
                    <Flex gap={2}>
                        <Badge
                            colorPalette={totalProfit >= 0 ? 'green' : 'red'}
                            variant="solid"
                            size="lg"
                            fontSize="md"
                            px={3}
                            py={1}
                        >
                            Total: {totalProfit.toFixed(2)}
                        </Badge>
                        <Badge
                            colorPalette="blue"
                            variant="solid"
                            size="lg"
                            fontSize="md"
                            px={3}
                            py={1}
                        >
                            Lots: {totalVolume.toFixed(2)}
                        </Badge>
                    </Flex>
                </Flex>

                <Flex gap={2} align="center" wrap="wrap">
                    <Flex align="center" gap={2}>
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            size="sm"
                            width="130px"
                            bg="glass.200"
                            color="white"
                            borderColor="border.glass"
                        />
                        <Text color="white">~</Text>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            size="sm"
                            width="130px"
                            bg="glass.200"
                            color="white"
                            borderColor="border.glass"
                        />
                        <Button size="sm" onClick={loadHistory} colorPalette="teal" variant="solid">
                            Search
                        </Button>
                    </Flex>

                    <Box width="1px" height="20px" bg="gray.600" mx={2} />

                    <select
                        value={filterConfig.symbol}
                        onChange={(e) => setFilterConfig({ ...filterConfig, symbol: e.target.value })}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '14px',
                            height: '32px'
                        }}
                    >
                        <option value="ALL" style={{ color: 'black' }}>All Symbols</option>
                        {uniqueSymbols.map(symbol => (
                            <option key={symbol} value={symbol} style={{ color: 'black' }}>{symbol}</option>
                        ))}
                    </select>
                    <select
                        value={filterConfig.type}
                        onChange={(e) => setFilterConfig({ ...filterConfig, type: e.target.value })}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '14px',
                            height: '32px'
                        }}
                    >
                        <option value="ALL" style={{ color: 'black' }}>All Types</option>
                        <option value="BUY" style={{ color: 'black' }}>BUY</option>
                        <option value="SELL" style={{ color: 'black' }}>SELL</option>
                    </select>
                </Flex>

                {loading && <Spinner color="teal.500" />}
            </Flex>
            <Box overflowX="auto">
                <Table.Root variant="line" size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader onClick={() => handleSort('open_time')} cursor="pointer" color="white" fontSize="xs" bg="gray.800">
                                Open Time <SortIcon columnKey="open_time" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('close_time')} cursor="pointer" color="white" fontSize="xs" bg="gray.800">
                                Close Time <SortIcon columnKey="close_time" />
                            </Table.ColumnHeader>

                            <Table.ColumnHeader onClick={() => handleSort('symbol')} cursor="pointer" color="white" fontSize="xs" bg="gray.800">
                                Symbol <SortIcon columnKey="symbol" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('type')} cursor="pointer" color="white" fontSize="xs" bg="gray.800">
                                Type <SortIcon columnKey="type" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('volume')} cursor="pointer" color="white" fontSize="xs" textAlign="right" bg="gray.800">
                                Volume <SortIcon columnKey="volume" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('open_price')} cursor="pointer" color="white" fontSize="xs" textAlign="right" bg="gray.800">
                                Open Price <SortIcon columnKey="open_price" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('close_price')} cursor="pointer" color="white" fontSize="xs" textAlign="right" bg="gray.800">
                                Close Price <SortIcon columnKey="close_price" />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader onClick={() => handleSort('profit')} cursor="pointer" color="white" fontSize="xs" textAlign="right" bg="gray.800">
                                Profit <SortIcon columnKey="profit" />
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sortedAndFilteredPositions.map((pos) => (
                            <Table.Row key={pos.position_id} bg="transparent" borderBottomColor="border.glass" _hover={{ bg: "glass.100" }}>
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{formatTime(pos.open_time)}</Table.Cell>
                                <Table.Cell color="text.main" borderBottomColor="border.glass">{formatTime(pos.close_time)}</Table.Cell>

                                <Table.Cell fontWeight="bold" color="text.main" borderBottomColor="border.glass">{pos.symbol}</Table.Cell>
                                <Table.Cell borderBottomColor="border.glass">
                                    <Badge
                                        colorPalette={pos.type === 'BUY' ? 'blue' : pos.type === 'SELL' ? 'red' : 'gray'}
                                        variant="solid"
                                        size="sm"
                                    >
                                        {pos.type}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{pos.volume}</Table.Cell>
                                <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{pos.open_price}</Table.Cell>
                                <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{pos.close_price}</Table.Cell>
                                <Table.Cell textAlign="right" color={pos.profit >= 0 ? 'green.300' : 'red.300'} borderBottomColor="border.glass">
                                    {pos.profit.toFixed(2)}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {sortedAndFilteredPositions.length === 0 && !loading && (
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
