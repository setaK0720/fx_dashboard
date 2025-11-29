import { Box, VStack, Link, Text } from '@chakra-ui/react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export const SidebarContent = ({ currentView, onNavigate }: SidebarProps) => {
    const linkStyle = (view: string) => ({
        textDecoration: 'none',
        color: currentView === view ? 'teal.300' : 'white',
        _hover: { color: 'teal.200' },
        cursor: 'pointer'
    });

    return (
        <VStack align="stretch" gap={4}>
            <Link onClick={() => onNavigate('dashboard')} {...linkStyle('dashboard')}>
                <Text fontWeight="bold">Dashboard</Text>
            </Link>
            <Link onClick={() => onNavigate('history')} {...linkStyle('history')}>
                <Text fontWeight="bold">History</Text>
            </Link>
            <Link onClick={() => onNavigate('account')} {...linkStyle('account')}>
                <Text fontWeight="bold">Account</Text>
            </Link>
            <Link onClick={() => onNavigate('data')} {...linkStyle('data')}>
                <Text fontWeight="bold">Data Management</Text>
            </Link>
            <Link onClick={() => onNavigate('analysis')} {...linkStyle('analysis')}>
                <Text fontWeight="bold">Market Analysis</Text>
            </Link>
            <Link onClick={() => onNavigate('sandbox')} {...linkStyle('sandbox')}>
                <Text fontWeight="bold">Logic Sandbox</Text>
            </Link>
            <Link onClick={() => onNavigate('account-analysis')} {...linkStyle('account-analysis')}>
                <Text fontWeight="bold">Account Analysis</Text>
            </Link>
            <Link onClick={() => onNavigate('backtest')} {...linkStyle('backtest')}>
                <Text fontWeight="bold">Backtest</Text>
            </Link>
            <Link _hover={{ textDecoration: 'none', color: 'teal.300' }}>
                <Text>Settings</Text>
            </Link>
        </VStack>
    );
};

export const Sidebar = ({ currentView, onNavigate }: SidebarProps) => {
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
            <SidebarContent currentView={currentView} onNavigate={onNavigate} />
        </Box>
    );
};
