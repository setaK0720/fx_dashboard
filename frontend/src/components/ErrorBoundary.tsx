import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, Button, Code } from '@chakra-ui/react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box p={10} bg="red.50" minH="100vh">
                    <Text fontSize="2xl" fontWeight="bold" color="red.600" mb={4}>
                        Something went wrong.
                    </Text>
                    <Text mb={4}>The application encountered an error and could not render.</Text>

                    {this.state.error && (
                        <Box mb={4} p={4} bg="white" borderRadius="md" border="1px solid" borderColor="red.200">
                            <Text fontWeight="bold" mb={2}>Error:</Text>
                            <Code display="block" whiteSpace="pre-wrap" p={2} bg="red.100" color="red.800">
                                {this.state.error.toString()}
                            </Code>
                        </Box>
                    )}

                    {this.state.errorInfo && (
                        <Box mb={4} p={4} bg="white" borderRadius="md" border="1px solid" borderColor="red.200">
                            <Text fontWeight="bold" mb={2}>Stack Trace:</Text>
                            <Code display="block" whiteSpace="pre-wrap" p={2} bg="gray.100" fontSize="xs" maxH="300px" overflowY="auto">
                                {this.state.errorInfo.componentStack}
                            </Code>
                        </Box>
                    )}

                    <Button onClick={() => window.location.reload()} colorScheme="red">
                        Reload Application
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}
