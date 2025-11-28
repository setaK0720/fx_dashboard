import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const AutoClosePanel: React.FC = () => {
    return (
        <Box p={4} bg="bg.panel" borderRadius="md">
            <Text color="text.main">AutoClosePanel Minimal</Text>
        </Box>
    );
};
