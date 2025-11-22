import { Flex, Heading, Text, Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { fetchStatus } from '../../lib/api';
import type { BotStatus } from '../../lib/api';

export const Header = () => {
    const [status, setStatus] = useState<BotStatus | null>(null);

    useEffect(() => {
        const fetch = () => fetchStatus().then(setStatus).catch(console.error);
        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.5rem"
            bg="gray.800"
            color="white"
            borderBottom="1px"
            borderColor="gray.700"
        >
            <Flex align="center" mr={5}>
                <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
                    FX Dashboard
                </Heading>
            </Flex>

            <Box display={{ base: 'block', md: 'none' }}>
                {/* Mobile menu icon could go here */}
            </Box>

            <Box
                display={{ base: 'none', md: 'flex' }}
                width={{ base: 'full', md: 'auto' }}
                alignItems="center"
                flexGrow={1}
            >
                <Text>Status: {status?.is_running ? 'Running' : 'Stopped'}</Text>
            </Box>
        </Flex>
    );
};
