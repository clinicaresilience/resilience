import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

import unusedImports from "eslint-plugin-unused-imports"; // adicione isso

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // incorpora suas extensões via FlatCompat
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // adiciona plugin e regras
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // desativa no-unused-vars padrão (ou do typescript) para não conflitar
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off", // se estiver usando TypeScript

      // ativa regras do plugin
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // mantém ignorados/ignores que você já tem
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
