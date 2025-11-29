import { Box, Flex, Text, Button, Input, Table, Badge, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listData, runSandbox } from '../../lib/api';
import type { DataFile, SandboxCondition } from '../../lib/api';
import { toaster } from '../../components/ui/toaster';

export const SandboxPanel = () => {
    const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [running, setRunning] = useState(false);

    // Simulation Params
    const [tp, setTp] = useState(20);
    const [sl, setSl] = useState(20);
    const [conditions, setConditions] = useState<SandboxCondition[]>([
        { indicator: 'RSI_14', operator: '<', value: 30, action: 'BUY' },
        { indicator: 'RSI_14', operator: '>', value: 70, action: 'SELL' }
    ]);

    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const files = await listData();
                setDataFiles(files);
                if (files.length > 0) {
                    setSelectedFile(files[0].filename);
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadFiles();
    }, []);

    const handleAddCondition = () => {
        setConditions([...conditions, { indicator: 'RSI_14', operator: '<', value: 50, action: 'BUY' }]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleConditionChange = (index: number, field: keyof SandboxCondition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setConditions(newConditions);
    };

    const handleRun = async () => {
        if (!selectedFile) return;
        setRunning(true);
        setResults(null);
        try {
            const file = dataFiles.find(f => f.filename === selectedFile);
            if (!file) return;

            const res = await runSandbox({
                symbol: file.symbol,
                timeframe: file.timeframe,
                conditions,
                tp,
                sl
            });
            setResults(res);
            toaster.create({
                title: 'Success',
                description: 'Simulation completed',
                type: 'success',
            });
        } catch (error: any) {
            console.error(error);
            toaster.create({
                title: 'Error',
                description: error.message || 'Simulation failed',
                type: 'error',
            });
        } finally {
            setRunning(false);
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
            <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>Logic Sandbox</Text>

            <Flex gap={6} wrap="wrap" mb={8}>
                {/* Settings Panel */}
                <Box flex="1" minW="300px" bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                    <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Settings</Text>

                    <Box mb={4}>
                        <Text color="gray.300" fontSize="sm" mb={1}>Data Source</Text>
                        <select
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '14px',
                                height: '32px',
                                width: '100%'
                            }}
                        >
                            <option value="" style={{ color: 'black' }}>Select Data</option>
                            {dataFiles.map(f => (
                                <option key={f.filename} value={f.filename} style={{ color: 'black' }}>
                                    {f.symbol} ({f.timeframe})
                                </option>
                            ))}
                        </select>
                    </Box>

                    <Flex gap={4} mb={4}>
                        <Box flex="1">
                            <Text color="gray.300" fontSize="sm" mb={1}>TP (pips)</Text>
                            <Input
                                type="number"
                                value={tp}
                                onChange={(e) => setTp(Number(e.target.value))}
                                bg="glass.200"
                                color="white"
                                borderColor="border.glass"
                            />
                        </Box>
                        <Box flex="1">
                            <Text color="gray.300" fontSize="sm" mb={1}>SL (pips)</Text>
                            <Input
                                type="number"
                                value={sl}
                                onChange={(e) => setSl(Number(e.target.value))}
                                bg="glass.200"
                                color="white"
                                borderColor="border.glass"
                            />
                        </Box>
                    </Flex>

                    <Text color="gray.300" fontSize="sm" mb={2}>Conditions</Text>
                    {conditions.map((cond, index) => (
                        <Flex key={index} gap={2} mb={2} align="center">
                            <Input
                                value={cond.indicator}
                                onChange={(e) => handleConditionChange(index, 'indicator', e.target.value)}
                                width="80px"
                                size="sm"
                                bg="glass.200"
                                color="white"
                                placeholder="Ind"
                            />
                            <select
                                value={cond.operator}
                                onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    padding: '0 4px',
                                    fontSize: '14px',
                                    height: '32px',
                                    width: '50px'
                                }}
                            >
                                <option value="<" style={{ color: 'black' }}>&lt;</option>
                                <option value=">" style={{ color: 'black' }}>&gt;</option>
                                <option value="<=" style={{ color: 'black' }}>&le;</option>
                                <option value=">=" style={{ color: 'black' }}>&ge;</option>
                                <option value="==" style={{ color: 'black' }}>=</option>
                            </select>
                            <Input
                                type="number"
                                value={cond.value}
                                onChange={(e) => handleConditionChange(index, 'value', Number(e.target.value))}
                                width="60px"
                                size="sm"
                                bg="glass.200"
                                color="white"
                            />
                            <select
                                value={cond.action}
                                onChange={(e) => handleConditionChange(index, 'action', e.target.value)}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    padding: '0 4px',
                                    fontSize: '14px',
                                    height: '32px',
                                    width: '60px'
                                }}
                            >
                                <option value="BUY" style={{ color: 'black' }}>BUY</option>
                                <option value="SELL" style={{ color: 'black' }}>SELL</option>
                            </select>
                            <Button
                                size="xs"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() => handleRemoveCondition(index)}
                            >
                                X
                            </Button>
                        </Flex>
                    ))}
                    <Button
                        size="sm"
                        onClick={handleAddCondition}
                        mt={2}
                        variant="outline"
                        color="white"
                        borderColor="white"
                        bg="transparent"
                        _hover={{ bg: "whiteAlpha.200" }}
                    >
                        + Add Condition
                    </Button>

                    <Button
                        mt={6}
                        width="100%"
                        colorPalette="teal"
                        variant="solid"
                        onClick={handleRun}
                        loading={running}
                        color="white"
                        bg="teal.500"
                        _hover={{ bg: "teal.600" }}
                    >
                        Run Simulation
                    </Button>
                </Box>

                {/* Results Panel */}
                <Box flex="1" minW="300px" bg="rgba(0,0,0,0.2)" p={4} borderRadius="md">
                    <Text fontSize="md" fontWeight="bold" color="white" mb={4}>Results</Text>

                    {running ? (
                        <Flex justify="center" py={10}>
                            <Spinner color="teal.500" size="xl" />
                        </Flex>
                    ) : results ? (
                        <Box>
                            <Flex gap={4} mb={6} wrap="wrap">
                                <Box bg="glass.200" p={3} borderRadius="md" flex="1" textAlign="center">
                                    <Text fontSize="xs" color="gray.400">Total Trades</Text>
                                    <Text fontSize="xl" fontWeight="bold" color="white">{results.total_trades}</Text>
                                </Box>
                                <Box bg="glass.200" p={3} borderRadius="md" flex="1" textAlign="center">
                                    <Text fontSize="xs" color="gray.400">Win Rate</Text>
                                    <Text fontSize="xl" fontWeight="bold" color={results.win_rate >= 50 ? "green.400" : "red.400"}>
                                        {results.win_rate}%
                                    </Text>
                                </Box>
                                <Box bg="glass.200" p={3} borderRadius="md" flex="1" textAlign="center">
                                    <Text fontSize="xs" color="gray.400">Total Pips</Text>
                                    <Text fontSize="xl" fontWeight="bold" color={results.total_pips >= 0 ? "green.400" : "red.400"}>
                                        {results.total_pips}
                                    </Text>
                                </Box>
                            </Flex>

                            <Text fontSize="sm" fontWeight="bold" color="white" mb={2}>Trade List (Last 10)</Text>
                            <Table.Root variant="line" size="sm">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader color="white" bg="gray.800">Type</Table.ColumnHeader>
                                        <Table.ColumnHeader color="white" bg="gray.800">Entry Time</Table.ColumnHeader>
                                        <Table.ColumnHeader color="white" bg="gray.800" textAlign="right">Pips</Table.ColumnHeader>
                                        <Table.ColumnHeader color="white" bg="gray.800">Result</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {results.trades.slice(-10).reverse().map((trade: any, i: number) => (
                                        <Table.Row key={i} bg="transparent" borderBottomColor="border.glass">
                                            <Table.Cell color={trade.type === 'BUY' ? 'blue.300' : 'red.300'}>{trade.type}</Table.Cell>
                                            <Table.Cell color="text.muted" fontSize="xs">{new Date(trade.entry_time).toLocaleString()}</Table.Cell>
                                            <Table.Cell textAlign="right" color={trade.profit_pips >= 0 ? 'green.400' : 'red.400'}>
                                                {trade.profit_pips}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge colorPalette={trade.result === 'WIN' ? 'green' : 'red'}>{trade.result}</Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    ) : (
                        <Text color="gray.400" textAlign="center" py={10}>
                            Run simulation to see results
                        </Text>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};
