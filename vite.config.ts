import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

import { toScssMap } from './src/shared/config/breakpoints';

// Пакет → vendor-чанк. Devtools не включаем: в dev они грузятся лениво, в prod — пустая заглушка.
const VENDOR_CHUNKS: Record<string, string> = {
  react: 'react-vendor',
  'react-dom': 'react-vendor',
  scheduler: 'react-vendor',
  'react-router': 'router-vendor',
  'react-router-dom': 'router-vendor',
  '@tanstack/query-core': 'query-vendor',
  '@tanstack/react-query': 'query-vendor',
  zustand: 'zustand-vendor',
};

export default defineConfig(async ({ mode }) => {
  // Загружаем .env.{mode} чтобы переменные были доступны на этапе конфигурации
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // Анализатор бандла — включается через: ANALYZE=true npm run build
  const extraPlugins: Plugin[] = [];
  if (env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    extraPlugins.push(
      visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'dist/stats.html' }),
    );
  }

  return {
    plugins: [react(), ...extraPlugins],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },

    // ─── SCSS ─────────────────────────────────────────────────────────────
    // Миксины брейкпоинтов (up / down / between) доступны в каждом .scss без импорта.
    // Значения берутся из src/shared/config/breakpoints.ts — те же, что у useMediaQuery.
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/shared/styles/breakpoints' as * with ($breakpoints: ${toScssMap()});\n`,
        },
      },
    },

    // ─── Dev-сервер ───────────────────────────────────────────────────────
    server: {
      port: 3000,
      strictPort: false,
      proxy: env.DEV_PROXY_TARGET
        ? {
            '/api': {
              target: env.DEV_PROXY_TARGET,
              changeOrigin: true,
              secure: true,
              cookieDomainRewrite: 'localhost', // чтобы куки с прод-домена сохранялись на localhost
            },
          }
        : undefined,
    },

    // ─── Сборка ───────────────────────────────────────────────────────────
    build: {
      target: 'es2022',
      outDir: 'dist',
      // Source maps в dev для отладки; в prod отключены (безопасность + размер)
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          // Разделение vendor-чанков для долгосрочного кэширования.
          // Хэш меняется только при обновлении конкретной библиотеки.
          // Функция, а не объект: объект ловит только точку входа пакета, и react-dom/client
          // уезжал в основной чанк. Здесь — любой модуль пакета по пути в node_modules.
          manualChunks: (id: string) => {
            const pkg = /node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(id)?.[1];
            return pkg ? VENDOR_CHUNKS[pkg] : undefined;
          },
        },
      },
    },

    // ─── Preview (vite preview) ───────────────────────────────────────────
    preview: {
      port: 4173,
    },
  };
});
