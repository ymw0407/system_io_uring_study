import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  base: '/system_io_uring_study/',
  plugins: [
    { enforce: 'pre' as const, ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
    vanillaExtractPlugin(),
  ],
});
