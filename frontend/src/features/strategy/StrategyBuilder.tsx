import { useState } from 'react';
import { Box, Text, Input, Button, VStack, HStack, Menu, Dialog, Portal } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toaster';
import { saveStrategy } from '../../lib/api';

// Types
type OperandType = 'indicator' | 'value';

interface Operand {
    type: OperandType;
    name?: string; // for indicator
    params?: any; // for indicator
    value?: number; // for value
}

interface Rule {
    id: string;
    left: Operand;
    operator: string;
    right: Operand;
}

interface StrategyConfig {
    entry_rules: Rule[];
    exit_rules: Rule[];
    sl_pips: number;
    tp_pips: number;
}

const OPERATORS = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: '==', label: '==' },
    { value: 'CROSS_OVER', label: 'Cross Over' },
    { value: 'CROSS_UNDER', label: 'Cross Under' },
];

const INDICATORS = [
    { name: 'rsi', label: 'RSI', params: [{ name: 'length', type: 'number', default: 14 }] },
    { name: 'sma', label: 'SMA', params: [{ name: 'length', type: 'number', default: 20 }] },
    { name: 'ema', label: 'EMA', params: [{ name: 'length', type: 'number', default: 20 }] },
    { name: 'close', label: 'Close Price', params: [] },
    { name: 'open', label: 'Open Price', params: [] },
    { name: 'high', label: 'High Price', params: [] },
    { name: 'low', label: 'Low Price', params: [] },
];

const DarkSelect = ({ value, options, onChange, width = "120px" }: any) => {
    const label = options.find((o: any) => o.value === value)?.label || value;
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button variant="outline" size="sm" width={width} justifyContent="space-between" bg="gray.800" color="white" borderColor="gray.600" _hover={{ bg: "gray.700" }}>
                    {label} <Box as="span">▼</Box>
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content bg="gray.900" borderColor="gray.700" minW={width} zIndex={1500}>
                        {options.map((op: any) => (
                            <Menu.Item
                                key={op.value}
                                value={op.value}
                                onClick={() => onChange(op.value)}
                                bg="gray.900"
                                color="white"
                                _hover={{ bg: "gray.800" }}
                                cursor="pointer"
                            >
                                {op.label}
                            </Menu.Item>
                        ))}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};

export const StrategyBuilder = () => {
    const [name, setName] = useState('');
    const [entryRules, setEntryRules] = useState<Rule[]>([]);
    const [exitRules, setExitRules] = useState<Rule[]>([]);
    const [sl, setSl] = useState(0);
    const [tp, setTp] = useState(0);
    const [loading, setLoading] = useState(false);

    const addRule = (type: 'entry' | 'exit') => {
        const newRule: Rule = {
            id: Math.random().toString(36).substr(2, 9),
            left: { type: 'indicator', name: 'rsi', params: { length: 14 } },
            operator: '>',
            right: { type: 'value', value: 50 }
        };
        if (type === 'entry') setEntryRules([...entryRules, newRule]);
        else setExitRules([...exitRules, newRule]);
    };

    const removeRule = (type: 'entry' | 'exit', id: string) => {
        if (type === 'entry') setEntryRules(entryRules.filter(r => r.id !== id));
        else setExitRules(exitRules.filter(r => r.id !== id));
    };

    const updateRule = (type: 'entry' | 'exit', id: string, updates: Partial<Rule>) => {
        const updater = (rules: Rule[]) => rules.map(r => r.id === id ? { ...r, ...updates } : r);
        if (type === 'entry') setEntryRules(updater(entryRules));
        else setExitRules(updater(exitRules));
    };

    const handleSave = async () => {
        if (!name) {
            toaster.create({ title: 'Please enter a strategy name', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const config: StrategyConfig = {
                entry_rules: entryRules,
                exit_rules: exitRules,
                sl_pips: Number(sl),
                tp_pips: Number(tp)
            };
            await saveStrategy(name, config);
            toaster.create({ title: 'Strategy saved successfully', type: 'success' });
        } catch (error: any) {
            toaster.create({ title: 'Failed to save strategy', description: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg="glass.100" p={6} borderRadius="xl" border="1px solid" borderColor="border.glass" backdropFilter="blur(10px)">
            <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>Strategy Builder</Text>

            <VStack gap={6} align="stretch">
                <Box>
                    <Text color="gray.300" mb={2}>Strategy Name</Text>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        bg="glass.200" color="white"
                        placeholder="My Strategy"
                    />
                </Box>

                <RuleSection
                    title="Entry Rules (BUY)"
                    rules={entryRules}
                    onAdd={() => addRule('entry')}
                    onRemove={(id) => removeRule('entry', id)}
                    onUpdate={(id, u) => updateRule('entry', id, u)}
                />

                <RuleSection
                    title="Exit Rules (CLOSE)"
                    rules={exitRules}
                    onAdd={() => addRule('exit')}
                    onRemove={(id) => removeRule('exit', id)}
                    onUpdate={(id, u) => updateRule('exit', id, u)}
                />

                <HStack gap={4}>
                    <Box flex={1}>
                        <Text color="gray.300" mb={2}>Stop Loss (Pips)</Text>
                        <Input type="number" value={sl} onChange={(e) => setSl(Number(e.target.value))} bg="glass.200" color="white" />
                    </Box>
                    <Box flex={1}>
                        <Text color="gray.300" mb={2}>Take Profit (Pips)</Text>
                        <Input type="number" value={tp} onChange={(e) => setTp(Number(e.target.value))} bg="glass.200" color="white" />
                    </Box>
                </HStack>

                <Button
                    onClick={handleSave}
                    isLoading={loading}
                    bg="teal.600" color="white" _hover={{ bg: "teal.700" }}
                >
                    Save Strategy
                </Button>
            </VStack>
        </Box>
    );
};

interface RuleSectionProps {
    title: string;
    rules: Rule[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Rule>) => void;
}

const RuleSection = ({ title, rules, onAdd, onRemove, onUpdate }: RuleSectionProps) => (
    <Box p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
        <HStack justify="space-between" mb={4}>
            <Text fontWeight="bold" color="white">{title}</Text>
            <Button size="xs" onClick={onAdd} bg="blue.600" color="white">+ Add Rule</Button>
        </HStack>
        <VStack gap={3} align="stretch">
            {rules.map((rule: Rule) => (
                <RuleRow key={rule.id} rule={rule} onRemove={() => onRemove(rule.id)} onUpdate={(u) => onUpdate(rule.id, u)} />
            ))}
            {rules.length === 0 && <Text color="gray.500" fontSize="sm">No rules defined.</Text>}
        </VStack>
    </Box>
);

const RuleRow = ({ rule, onRemove, onUpdate }: { rule: Rule, onRemove: () => void, onUpdate: (u: Partial<Rule>) => void }) => {
    return (
        <HStack gap={2} bg="glass.200" p={2} borderRadius="md">
            <OperandInput operand={rule.left} onChange={(op) => onUpdate({ left: op })} />

            <DarkSelect
                value={rule.operator}
                options={OPERATORS}
                onChange={(val: string) => onUpdate({ operator: val })}
                width="120px"
            />

            <OperandInput operand={rule.right} onChange={(op) => onUpdate({ right: op })} />

            <Button size="xs" colorPalette="red" variant="ghost" onClick={onRemove}>X</Button>
        </HStack>
    );
};

const OperandInput = ({ operand, onChange }: { operand: Operand, onChange: (op: Operand) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTypeChange = (val: string) => {
        const type = val as OperandType;
        if (type === 'value') onChange({ type, value: 0 });
        else onChange({ type, name: 'rsi', params: { length: 14 } });
    };

    return (
        <HStack gap={1} flex={1}>
            <DarkSelect
                value={operand.type}
                options={[{ value: 'indicator', label: 'Indicator' }, { value: 'value', label: 'Value' }]}
                onChange={handleTypeChange}
                width="100px"
            />

            {operand.type === 'value' ? (
                <Input
                    type="number"
                    value={operand.value}
                    onChange={(e) => onChange({ ...operand, value: Number(e.target.value) })}
                    bg="gray.800" color="white" size="sm"
                />
            ) : (
                <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                    <Dialog.Trigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            color="white"
                            bg="gray.800"
                            borderColor="gray.600"
                            _hover={{ bg: "gray.700" }}
                            flex={1}
                            justifyContent="start"
                        >
                            {operand.name?.toUpperCase()} {operand.params?.length ? `(${operand.params.length})` : ''}
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content bg="gray.900" color="white">
                                <Dialog.Header>
                                    <Dialog.Title>Configure Indicator</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <IndicatorConfig operand={operand} onChange={onChange} />
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button onClick={() => setIsOpen(false)}>Done</Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}
        </HStack>
    );
};

interface IndicatorConfigProps {
    operand: Operand;
    onChange: (op: Operand) => void;
}

const IndicatorConfig = ({ operand, onChange }: IndicatorConfigProps) => {
    const currentInd = INDICATORS.find(i => i.name === operand.name) || INDICATORS[0];

    const handleNameChange = (val: string) => {
        const newName = val;
        const ind = INDICATORS.find(i => i.name === newName);
        if (ind) {
            const defaultParams = ind.params.reduce((acc: any, p) => ({ ...acc, [p.name]: p.default }), {});
            onChange({ ...operand, name: newName, params: defaultParams });
        }
    };

    const handleParamChange = (name: string, value: any) => {
        onChange({ ...operand, params: { ...operand.params, [name]: Number(value) } });
    };

    return (
        <VStack align="stretch" gap={4}>
            <Box>
                <Text mb={1}>Indicator</Text>
                <DarkSelect
                    value={operand.name}
                    options={INDICATORS.map(i => ({ value: i.name, label: i.label }))}
                    onChange={handleNameChange}
                    width="100%"
                />
            </Box>

            {currentInd.params.map(p => (
                <Box key={p.name}>
                    <Text mb={1}>{p.name}</Text>
                    <Input
                        type={p.type}
                        value={operand.params[p.name]}
                        onChange={(e) => handleParamChange(p.name, e.target.value)}
                    />
                </Box>
            ))}
        </VStack>
    );
};
