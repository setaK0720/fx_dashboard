import { Box, Text } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '10:00', price: 150.00 },
    { time: '10:05', price: 150.05 },
    { time: '10:10', price: 150.02 },
    { time: '10:15', price: 150.08 },
    { time: '10:20', price: 150.10 },
    { time: '10:25', price: 150.06 },
];

interface ChartWidgetProps {
    symbol: string;
}

export const ChartWidget = ({ symbol }: ChartWidgetProps) => {
    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700" height="400px" mb={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>{symbol} Chart</Text>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis domain={['auto', 'auto']} stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};
