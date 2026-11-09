import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'public/app'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Las pantallas no importan servicios concretos: siempre pasan por el contenedor.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/*/mock*'],
              message:
                'Usa los servicios desde @/services (el contenedor), no la implementación concreta.',
            },
          ],
        },
      ],
    },
  },
  {
    // App de Rouviere (JavaScript con módulos ES).
    files: ['src/rouviere/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        THREE: 'readonly',
        Tesseract: 'readonly',
        pdfjsLib: 'readonly',
        claude: 'readonly',
      },
    },
    rules: {
      // El código original usa catch vacíos a propósito (almacenamiento bloqueado, archivos que fallan).
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      // Deuda técnica conocida del código original: se avisa, no bloquea. Ver docs/ARQUITECTURA.md.
      'no-redeclare': 'warn',
    },
  },
  {
    files: ['src/services/**', 'src/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
