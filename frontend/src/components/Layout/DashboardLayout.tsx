import { Box, Flex, Drawer, useDisclosure } from '@chakra-ui/react';
import { Header } from './Header';
import { Sidebar, SidebarContent } from './Sidebar';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, onNavigate }: DashboardLayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const handleNavigate = (view: string) => {
        onNavigate(view);
        onClose();
    };

    return (
        <Box minH="100vh" bg="transparent">
            <Header onMenuClick={onOpen} />
            <Flex>
                <Sidebar currentView={currentView} onNavigate={onNavigate} />

                <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start">
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content bg="gray.900" color="white">
                            <Drawer.Header>
                                <Drawer.Title>Menu</Drawer.Title>
                                <Drawer.CloseTrigger />
                            </Drawer.Header>
                            <Drawer.Body>
                                <SidebarContent currentView={currentView} onNavigate={handleNavigate} />
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Drawer.Root>

                <Box flex="1" p={0} color="text.main">
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};
