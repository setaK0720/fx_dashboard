import { Box, Button, Flex, Input, Table, Text, Spinner, Badge } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { downloadData, listData } from '../../lib/api';
import type { DataFile } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

export const DataManagementPanel = () => {
    const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Download form state
    const [symbol, setSymbol] = useState('USDJPY');
    const [timeframe, setTimeframe] = useState('M1');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const loadDataList = async () => {
        setLoading(true);
        try {
            const files = await listData();
            setDataFiles(files);
        } catch (error) {
            console.error('Failed to list data:', error);
            toaster.create({
                title: 'Error',
                description: 'Failed to load data list',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDataList();
    }, []);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadData({
                symbol,
                timeframe,
                start_date: startDate,
                end_date: endDate
            });
            toaster.create({
                title: 'Success',
                description: `Downloaded ${symbol} ${timeframe}`,
                type: 'success',
            });
            loadDataList(); // Refresh list
        } catch (error: any) {
            console.error('Failed to download:', error);
            toaster.create({
                title: 'Error',
                description: error.message || 'Failed to download data',
                type: 'error',
            });
        } finally {
            setDownloading(false);
        }
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
            <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>Historical Data Management</Text>

            {/* Download Form */}
            <Box mb={8} p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Download New Data</Text>
                <Flex gap={4} wrap="wrap" align="flex-end">
                    <Box>
                        <Text color="gray.300" fontSize="sm" mb={1}>Symbol</Text>
                        <Input
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            width="120px"
                            bg="glass.200"
                            color="white"
                            borderColor="border.glass"
                        />
                    </Box>
                    <Box>
                        <Text color="gray.300" fontSize="sm" mb={1}>Timeframe</Text>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '14px',
                                height: '40px',
                                width: '100px'
                            }}
                        >
                            {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map(tf => (
                                <option key={tf} value={tf} style={{ color: 'black' }}>{tf}</option>
                            ))}
                        </select>
                    </Box>
                    <Box>
                        <Text color="gray.300" fontSize="sm" mb={1}>Start Date</Text>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            bg="glass.200"
                            color="white"
                            borderColor="border.glass"
                        />
                    </Box>
                    <Box>
                        <Text color="gray.300" fontSize="sm" mb={1}>End Date</Text>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            bg="glass.200"
                            color="white"
                            borderColor="border.glass"
                        />
                    </Box>
                    <Button
                        onClick={handleDownload}
                        loading={downloading}
                        colorPalette="teal"
                        variant="solid"
                    >
                        Download
                    </Button>
                </Flex>
            </Box>

            {/* Data List */}
            <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Available Data</Text>
            {loading ? (
                <Flex justify="center" py={8}>
                    <Spinner color="teal.500" />
                </Flex>
            ) : (
                <Box overflowX="auto">
                    <Table.Root variant="line" size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader color="white" bg="gray.800">Symbol</Table.ColumnHeader>
                                <Table.ColumnHeader color="white" bg="gray.800">Timeframe</Table.ColumnHeader>
                                <Table.ColumnHeader color="white" bg="gray.800">Start Date</Table.ColumnHeader>
                                <Table.ColumnHeader color="white" bg="gray.800">End Date</Table.ColumnHeader>
                                <Table.ColumnHeader color="white" bg="gray.800" textAlign="right">Count</Table.ColumnHeader>
                                <Table.ColumnHeader color="white" bg="gray.800">Filename</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {dataFiles.map((file) => (
                                <Table.Row key={file.filename} bg="transparent" borderBottomColor="border.glass" _hover={{ bg: "glass.100" }}>
                                    <Table.Cell fontWeight="bold" color="text.main" borderBottomColor="border.glass">{file.symbol}</Table.Cell>
                                    <Table.Cell color="text.main" borderBottomColor="border.glass">
                                        <Badge colorPalette="blue" variant="solid">{file.timeframe}</Badge>
                                    </Table.Cell>
                                    <Table.Cell color="text.muted" borderBottomColor="border.glass">{new Date(file.start).toLocaleString()}</Table.Cell>
                                    <Table.Cell color="text.muted" borderBottomColor="border.glass">{new Date(file.end).toLocaleString()}</Table.Cell>
                                    <Table.Cell textAlign="right" color="text.main" borderBottomColor="border.glass">{file.count.toLocaleString()}</Table.Cell>
                                    <Table.Cell color="text.muted" borderBottomColor="border.glass" fontSize="xs">{file.filename}</Table.Cell>
                                </Table.Row>
                            ))}
                            {dataFiles.length === 0 && (
                                <Table.Row bg="transparent">
                                    <Table.Cell colSpan={6} textAlign="center" color="text.muted" py={4}>
                                        No data available
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            )}
        </Box>
    );
};
