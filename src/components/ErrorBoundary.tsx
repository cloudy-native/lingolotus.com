import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
} from "@chakra-ui/react";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Prevents the entire app from crashing when a component fails.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // In production, you could send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <Container maxW="container.md" py={16}>
                    <VStack spacing={6} textAlign="center">
                        <Box fontSize="6xl">😔</Box>
                        <Heading as="h1" size="xl">
                            Oops! Something went wrong
                        </Heading>
                        <Text fontSize="lg" color="gray.600">
                            We encountered an unexpected error. Don't worry,
                            your data is safe.
                        </Text>
                        {process.env.NODE_ENV === "development" &&
                            this.state.error && (
                                <Box
                                    bg="red.50"
                                    borderWidth="1px"
                                    borderColor="red.200"
                                    borderRadius="md"
                                    p={4}
                                    textAlign="left"
                                    width="100%"
                                    maxW="600px"
                                >
                                    <Text
                                        fontWeight="bold"
                                        color="red.700"
                                        mb={2}
                                    >
                                        Error Details (Development Only):
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        fontFamily="mono"
                                        color="red.600"
                                    >
                                        {this.state.error.toString()}
                                    </Text>
                                </Box>
                            )}
                        <VStack spacing={3}>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => (window.location.href = "/")}
                            >
                                Go to Homepage
                            </Button>
                        </VStack>
                    </VStack>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
