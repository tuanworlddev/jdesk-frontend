import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Our effects read browser-only APIs (matchMedia, scroll position,
      // localStorage theme) after mount to stay SSR-safe — a single setState on
      // mount is intended here, so keep this rule as a hint, not a build error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
