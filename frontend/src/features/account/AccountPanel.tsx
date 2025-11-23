import { Box, Heading, VStack, Text, Button, Badge, HStack, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { toaster } from '../../components/ui/toaster';

interface AccountInfo {
    accounts: string[];
    current_account: string;
    connected: boolean;
}

export const AccountPanel = () => {
    const [info, setInfo] = useState<AccountInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/accounts');
            if (!res.ok) throw new Error('Failed to fetch accounts');
            const data = await res.json();
            setInfo(data);
        } catch (error) {
            toaster.create({
                title: 'Error fetching accounts',
                description: String(error),
                type: 'error',
            });
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSwitch = async (accountName: string) => {
        if (info?.current_account === accountName) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/accounts/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_name: accountName }),
            });

            if (!res.ok) throw new Error('Failed to switch account');

            toaster.create({
                title: 'Account switched',
                description: `Switched to ${accountName}`,
                type: 'success',
            });

            await fetchAccounts();
        } catch (error) {
            toaster.create({
                title: 'Switch failed',
                description: String(error),
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!info) return <Spinner />;

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <Heading size="md" mb={4}>Account Management</Heading>

            <VStack align="stretch" gap={3}>
                {info.accounts.map(account => (
                    <Box
                        key={account}
                        p={3}
                        bg="gray.700"
                        borderRadius="md"
                        borderWidth={account === info.current_account ? "2px" : "1px"}
                        borderColor={account === info.current_account ? "teal.400" : "gray.600"}
                    >
                        <HStack justify="space-between">
                            <VStack align="start" gap={0}>
                                <Text fontWeight="bold" fontSize="lg">{account}</Text>
                                {account === info.current_account && (
                                    <Badge colorPalette={info.connected ? "green" : "red"}>
                                        {info.connected ? "Connected" : "Disconnected"}
                                    </Badge>
                                )}
                            </VStack>

                            <Button
                                size="sm"
                                colorPalette={account === info.current_account ? "gray" : "teal"}
                                disabled={account === info.current_account || loading}
                                onClick={() => handleSwitch(account)}
                            >
                                {loading && account !== info.current_account ? <Spinner size="xs" /> : (account === info.current_account ? "Active" : "Switch")}
                            </Button>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};
