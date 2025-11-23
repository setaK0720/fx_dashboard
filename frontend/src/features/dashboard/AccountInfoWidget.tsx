import { Box, Heading, SimpleGrid, Stat, HStack, Badge } from '@chakra-ui/react';
import { useAccountInfo } from '../../hooks/useAccountInfo';

export const AccountInfoWidget = () => {
    const { accountInfo, isConnected } = useAccountInfo();

    if (!accountInfo) {
        return (
            <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
                <Heading size="md" mb={4}>口座情報 {isConnected ? '(接続中)' : '(接続中...)'}</Heading>
                <Box>読み込み中...</Box>
            </Box>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: accountInfo.currency }).format(value);
    };

    return (
        <Box p={4} bg="gray.800" borderRadius="md" border="1px" borderColor="gray.700">
            <HStack justify="space-between" mb={4}>
                <Heading size="md">口座情報</Heading>
                <Badge colorPalette={isConnected ? "green" : "red"}>{isConnected ? "接続中" : "切断"}</Badge>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
                <Stat.Root>
                    <Stat.Label>残高</Stat.Label>
                    <Stat.ValueText fontSize="xl">{formatCurrency(accountInfo.balance)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>有効証拠金</Stat.Label>
                    <Stat.ValueText fontSize="xl" color={accountInfo.equity >= accountInfo.balance ? "green.300" : "red.300"}>
                        {formatCurrency(accountInfo.equity)}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>必要証拠金</Stat.Label>
                    <Stat.ValueText fontSize="xl">{formatCurrency(accountInfo.margin)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>余剰証拠金</Stat.Label>
                    <Stat.ValueText fontSize="xl">{formatCurrency(accountInfo.margin_free)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>証拠金維持率</Stat.Label>
                    <Stat.ValueText fontSize="xl">
                        {accountInfo.margin_level === 0 ? '-' : `${accountInfo.margin_level.toFixed(2)}%`}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>含み損益</Stat.Label>
                    <Stat.ValueText fontSize="xl" color={accountInfo.profit >= 0 ? "green.300" : "red.300"}>
                        {formatCurrency(accountInfo.profit)}
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>クレジット</Stat.Label>
                    <Stat.ValueText fontSize="xl">{formatCurrency(accountInfo.credit)}</Stat.ValueText>
                </Stat.Root>
            </SimpleGrid>
        </Box>
    );
};
