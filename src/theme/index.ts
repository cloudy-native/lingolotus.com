import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Color configuration for light/dark mode
const config: ThemeConfig = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

// chakrathemes.com "lingo lotus"
//
const theme = extendTheme({
    config,
    colors: {
        accent: {
            "50": "#ffeeba",
            "100": "#ffe69c",
            "200": "#ffdc74",
            "300": "#ffd24c",
            "400": "#ffc825",
            "500": "#ffc107",
            "600": "#e7ad00",
            "700": "#bd8d00",
            "800": "#936e00",
            "900": "#694f00",
        },
        background: {
            "50": "#fcfcfc",
            "100": "#fbfbfb",
            "200": "#f9f9f9",
            "300": "#f8f8f8",
            "400": "#f6f6f6",
            "500": "#f5f5f5",
            "600": "#cacaca",
            "700": "#919191",
            "800": "#595959",
            "900": "#202020",
        },
        primary: {
            "50": "#c8cdec",
            "100": "#b0b8e4",
            "200": "#919bd9",
            "300": "#717fce",
            "400": "#5163c3",
            "500": "#3f51b5",
            "600": "#37479f",
            "700": "#2d3a82",
            "800": "#232d65",
            "900": "#192048",
        },
        secondary: {
            "50": "#ffcadc",
            "100": "#ffb3cd",
            "200": "#ff94b8",
            "300": "#ff75a4",
            "400": "#ff5790",
            "500": "#ff4081",
            "600": "#ff1967",
            "700": "#e3004d",
            "800": "#ae003b",
            "900": "#7a0029",
        },
    },
    components: {},
    styles: {},
});

export default theme;
