import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box p={5} bg="red.900" color="white">
                    <Heading>Something went wrong.</Heading>
                    <Text>{this.state.error?.toString()}</Text>
                </Box>
            );
        }

        return this.props.children;
    }
}
