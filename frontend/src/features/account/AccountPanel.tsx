import { Box, Heading, VStack, Text, Button, Badge, HStack, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { toaster } from '../../components/ui/toaster';

interface AccountDetail {
    name: string;
    account_number: number | null;
    server: string | null;
}

interface AccountInfo {
    accounts: AccountDetail[];
    current_account: string;
    connected: boolean;
}

export const AccountPanel = () => {
    const [info, setInfo] = useState<AccountInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
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
            const res = await fetch('/api/accounts/switch', {
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
        <Box p={4} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Heading size="md" mb={4} color="text.main">Account Management</Heading>

            <VStack align="stretch" gap={3}>
                {info.accounts.map(account => (
                    <Box
                        key={account.name}
                        p={3}
                        bg="glass.100"
                        borderRadius="md"
                        borderWidth={account.name === info.current_account ? "2px" : "1px"}
                        borderColor={account.name === info.current_account ? "teal.400" : "border.glass"}
                    >
                        <HStack justify="space-between">
                            <VStack align="start" gap={1}>
                                <Text fontWeight="bold" fontSize="lg" color="text.main">{account.name}</Text>
                                {account.account_number && (
                                    <Text fontSize="sm" color="text.muted">
                                        口座番号: {account.account_number}
                                    </Text>
                                )}
                                {account.server && (
                                    <Text fontSize="sm" color="text.muted">
                                        サーバー: {account.server}
                                    </Text>
                                )}
                                {account.name === info.current_account && (
                                    <Badge colorPalette={info.connected ? "green" : "red"}>
                                        {info.connected ? "Connected" : "Disconnected"}
                                    </Badge>
                                )}
                            </VStack>

                            <Button
                                size="sm"
                                variant={account.name === info.current_account ? "outline" : "solid"}
                                colorPalette={account.name === info.current_account ? "gray" : "teal"}
                                disabled={account.name === info.current_account || loading}
                                onClick={() => handleSwitch(account.name)}
                            >
                                {loading && account.name !== info.current_account ? <Spinner size="xs" /> : (account.name === info.current_account ? "Active" : "Switch")}
                            </Button>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};
