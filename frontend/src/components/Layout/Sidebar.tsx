import { Box, VStack, Link, Text } from '@chakra-ui/react';

export const Sidebar = () => {
    return (
        <Box
            w="250px"
            bg="gray.900"
            color="white"
            borderRight="1px"
            borderColor="gray.700"
            minH="calc(100vh - 80px)" // Adjust based on header height
            p={4}
            display={{ base: 'none', md: 'block' }}
        >
            <VStack align="stretch" gap={4}>
                <Link _hover={{ textDecoration: 'none', color: 'teal.300' }}>
                    <Text fontWeight="bold">Dashboard</Text>
                </Link>
                <Link _hover={{ textDecoration: 'none', color: 'teal.300' }}>
                    <Text>Positions</Text>
                </Link>
                <Link _hover={{ textDecoration: 'none', color: 'teal.300' }}>
                    <Text>Settings</Text>
                </Link>
            </VStack>
        </Box>
    );
};
