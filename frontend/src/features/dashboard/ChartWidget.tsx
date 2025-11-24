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
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" height="400px" backdropFilter="blur(10px)">
            <Text fontSize="md" fontWeight="bold" mb={2} color="text.main">{symbol} Chart</Text>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                    <XAxis dataKey="time" stroke="#a0a0a0" fontSize={12} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#a0a0a0" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 10, 30, 0.9)', borderColor: 'rgba(138, 43, 226, 0.3)', color: '#fff' }} />
                    <Line type="monotone" dataKey="price" stroke="#00ffff" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};
