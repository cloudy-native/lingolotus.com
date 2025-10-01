import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import theme from "./theme";

// Wrap all pages with the ChakraProvider and ErrorBoundary
export const wrapRootElement = ({ element }: { element: React.ReactNode }) => {
    return (
        <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider resetCSS theme={theme}>
                <ErrorBoundary>{element}</ErrorBoundary>
            </ChakraProvider>
        </>
    );
};

// Wrap all pages with the Layout component
export const wrapPageElement = ({ element }: { element: React.ReactNode }) => {
    return <Layout>{element}</Layout>;
};
