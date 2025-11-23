import { Box, Flex } from '@chakra-ui/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, onNavigate }: DashboardLayoutProps) => {
    return (
        <Box minH="100vh" bg="gray.900">
            <Header />
            <Flex>
                <Sidebar currentView={currentView} onNavigate={onNavigate} />
                <Box flex="1" p={6} color="white">
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};
