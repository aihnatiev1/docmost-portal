import {
  createTheme,
  CSSVariablesResolver,
  MantineColorsTuple,
  Tabs,
} from "@mantine/core";

// Midnight Electric palette mapped to Mantine 10-shade format
const indigo: MantineColorsTuple = [
  "#eef2ff",
  "#e0e7ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818CF8", // accent-indigo-2
  "#6366F1", // accent-indigo (primary)
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
];

const violet: MantineColorsTuple = [
  "#f5f3ff",
  "#ede9fe",
  "#ddd6fe",
  "#c4b5fd",
  "#A78BFA",
  "#8B5CF6", // accent-violet
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
];

const red: MantineColorsTuple = [
  "#fff1f2",
  "#ffe4e6",
  "#fecdd3",
  "#fda4af",
  "#fb7185",
  "#F87171", // danger
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#881337",
];

export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 5, dark: 5 },
  colors: {
    blue: indigo,
    indigo,
    violet,
    red,
  },
  fontFamily: "'DM Sans', var(--mantine-font-family-default)",
  fontFamilyMonospace: "'JetBrains Mono', var(--mantine-font-family-monospace-default)",
  headings: {
    fontFamily: "'Bricolage Grotesque', var(--mantine-font-family-default)",
    fontWeight: "500",
  },
  defaultRadius: "md",
  components: {
    Tabs: Tabs.extend({
      vars: (_theme, props) => ({
        root: {
          ...(props.color === "dark" && {
            "--tabs-color": "var(--mantine-color-dark-default)",
          }),
        },
      }),
    }),
  },
});

export const mantineCssResolver: CSSVariablesResolver = (_theme) => ({
  variables: {
    "--input-error-size": _theme.fontSizes.sm,
  },
  light: {
    "--mantine-color-dimmed": "#6b7280",
    "--mantine-color-dark-light-color": "#4e5359",
    "--mantine-color-dark-light-hover": "var(--mantine-color-gray-light-hover)",
  },
  dark: {
    // Midnight Electric surfaces
    "--mantine-color-body": "var(--bg-050, #0B0D12)",
    "--mantine-color-dark-0": "var(--text-200, #C2C6D4)",
    "--mantine-color-dark-1": "var(--text-300, #8B92A5)",
    "--mantine-color-dark-2": "var(--text-400, #5C6475)",
    "--mantine-color-dark-3": "var(--border-strong, #2A2F3E)",
    "--mantine-color-dark-4": "var(--border, #1E2230)",
    "--mantine-color-dark-5": "var(--bg-400, #242834)",
    "--mantine-color-dark-6": "var(--bg-200, #181B24)",
    "--mantine-color-dark-7": "var(--bg-100, #0F1219)",
    "--mantine-color-dark-8": "var(--bg-050, #0B0D12)",
    "--mantine-color-dark-9": "var(--bg-000, #07080C)",
    "--mantine-color-dark-filled": "var(--accent-indigo, #6366F1)",
    "--mantine-color-dark-light-color": "var(--text-300, #8B92A5)",
    "--mantine-color-dark-light-hover": "var(--bg-200, #181B24)",
    "--mantine-color-dimmed": "var(--text-400, #5C6475)",
    "--mantine-color-text": "var(--text-200, #C2C6D4)",
    "--mantine-color-default-border": "var(--border, #1E2230)",
    "--mantine-color-default-hover": "var(--bg-150, #13161D)",
  },
});
