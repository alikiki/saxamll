import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    resolve: {
        alias: {
            saxamll: mode === 'dist'
                ? resolve(__dirname, './dist/index.js')
                : resolve(__dirname, './src/index.ts')
        }
    }
}));