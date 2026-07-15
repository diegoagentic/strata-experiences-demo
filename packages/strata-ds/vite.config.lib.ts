import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Custom plugin to copy assets
const copyAssets = () => {
    return {
        name: 'copy-assets',
        closeBundle: async () => {
            const srcDir = resolve(__dirname, 'src/styles/tokens');
            const destDir = resolve(__dirname, 'dist/styles/tokens');

            if (fs.existsSync(srcDir)) {
                fs.mkdirSync(destDir, { recursive: true });
                const files = fs.readdirSync(srcDir);
                files.forEach(file => {
                    if (file.endsWith('.css')) {
                        fs.copyFileSync(
                            path.join(srcDir, file),
                            path.join(destDir, file)
                        );
                        console.log(`Copied ${file} to dist/styles/tokens`);
                    }
                });
            }
        }
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // dts plugin removed — .d.ts generation not needed for Vercel deploy
        // and was the main source of TS6133/TS2322 build failures
        copyAssets(),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/components/index.ts'),
                tokens: resolve(__dirname, 'src/tokens/tokens.ts'),
            },
            name: 'WhiteLabelDesignSystem',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'js' : 'cjs';
                return `${entryName}.${ext}`;
            },
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'lucide-react',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
                preserveModules: false,
                exports: 'named',
            },
        },
        sourcemap: false,
        minify: 'esbuild',
        target: 'es2015',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
