import { Box, Heading, Stat, HStack, Badge, Flex, Spinner, chakra } from '@chakra-ui/react';
import { useAccountInfo } from '../../hooks/useAccountInfo';
import { useAccountList } from '../../hooks/useAccountList';

export const AccountInfoWidget = () => {
    const { accountInfo, isConnected } = useAccountInfo();
    const { accounts, switchAccount, switching } = useAccountList();

    if (!accountInfo) {
        return (
            <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
                <Heading size="sm" mb={2} color="text.main">口座情報 {isConnected ? '(接続中)' : '(接続中...)'}</Heading>
                <Box color="text.muted">読み込み中...</Box>
            </Box>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: accountInfo.currency }).format(value);
    };

    return (
        <Box p={2} bg="bg.panel" borderRadius="md" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <HStack justify="space-between" mb={2}>
                <HStack gap={4}>
                    <Heading size="sm" color="text.main">口座情報</Heading>
                    <Box position="relative">
                        <chakra.select
                            value={accountInfo.account_name}
                            onChange={(e: any) => switchAccount(e.target.value)}
                            disabled={switching}
                            bg="glass.100"
                            color="text.main"
                            borderColor="border.glass"
                            borderWidth="1px"
                            borderRadius="md"
                            fontSize="sm"
                            h="24px"
                            pl={2}
                            pr={6}
                            _focus={{ outline: 'none', borderColor: 'teal.400' }}
                            cursor="pointer"
                        >
                            {accounts.map(acc => (
                                <option key={acc.name} value={acc.name} style={{ color: 'black' }}>
                                    {acc.name}
                                </option>
                            ))}
                        </chakra.select>
                        {switching && (
                            <Box position="absolute" right="-20px" top="4px">
                                <Spinner size="xs" />
                            </Box>
                        )}
                    </Box>
                </HStack>
                <Badge colorPalette={isConnected ? "green" : "red"} variant="solid" size="sm">{isConnected ? "接続中" : "切断"}</Badge>
            </HStack>

            <Flex wrap="wrap" gap={2}>
                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">残高</Stat.Label>
                    <Stat.ValueText fontSize="md" color="text.main">{formatCurrency(accountInfo.balance)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">有効証拠金</Stat.Label>
                    <Stat.ValueText fontSize="md" color={accountInfo.equity >= accountInfo.balance ? "green.300" : "red.300"}>
                        {formatCurrency(accountInfo.equity)}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">必要証拠金</Stat.Label>
                    <Stat.ValueText fontSize="md" color="text.main">{formatCurrency(accountInfo.margin)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">余剰証拠金</Stat.Label>
                    <Stat.ValueText fontSize="md" color="text.main">{formatCurrency(accountInfo.margin_free)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">証拠金維持率</Stat.Label>
                    <Stat.ValueText fontSize="md" color="text.main">
                        {accountInfo.margin_level === 0 ? '-' : `${accountInfo.margin_level.toFixed(2)}%`}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">含み損益</Stat.Label>
                    <Stat.ValueText fontSize="md" color={accountInfo.profit >= 0 ? "green.300" : "red.300"}>
                        {formatCurrency(accountInfo.profit)}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root flex="1" minW="140px" p={2} bg="glass.100" borderRadius="md">
                    <Stat.Label color="text.muted" fontSize="xs">クレジット</Stat.Label>
                    <Stat.ValueText fontSize="md" color="text.main">{formatCurrency(accountInfo.credit)}</Stat.ValueText>
                </Stat.Root>
            </Flex>
        </Box>
    );
};
