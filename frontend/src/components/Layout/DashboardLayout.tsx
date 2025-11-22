import { Box, Flex } from '@chakra-ui/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <Box minH="100vh" bg="gray.900">
            <Header />
            <Flex>
                <Sidebar />
                <Box flex="1" p={6} color="white">
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};
