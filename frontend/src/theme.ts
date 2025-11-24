import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                violet: {
                    500: { value: "#7c7c8a" }, // Gray-ish violet
                    600: { value: "#6b6b78" },
                    900: { value: "#1a1a1e" },
                },
            },
        },
        semanticTokens: {
            colors: {
                glass: {
                    100: { value: "rgba(30, 30, 35, 0.6)" },
                    200: { value: "rgba(30, 30, 35, 0.8)" },
                },
                border: {
                    glass: { value: "rgba(124, 124, 138, 0.3)" }, // Using violet.500 with opacity
                },
                bg: {
                    panel: { value: "rgba(20, 20, 25, 0.7)" },
                },
                text: {
                    main: { value: "#e0e0e0" },
                    muted: { value: "#909095" },
                }
            },
        },
    },
    globalCss: {
        "html, body": {
            bg: "linear-gradient(135deg, #050505 0%, #1a1a1e 100%)",
            color: "text.main",
            minHeight: "100vh",
        },
    },
})

export const system = createSystem(defaultConfig, config)
