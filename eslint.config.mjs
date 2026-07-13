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
      // Several effects read browser-only state on mount (matchMedia, scroll
      // position, localStorage theme, search params, modal-open resets) to stay
      // SSR-safe. A single setState in those effects is intentional and correct;
      // this rule flags the whole pattern as a false positive, so it is off.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
