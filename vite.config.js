import { defineConfig } from 'vite';
import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Cada componente se compila como su propio punto de entrada, para que
 * se pueda importar de forma independiente:
 *
 *   import { Modal } from 'libreria-componentes-accesibles/modal';
 *
 * Genera dist/<componente>/<componente>.js (ESM) y su .css asociado.
 */
const componentEntries = Object.fromEntries(
  globSync('src/components/*/*.js')
    .filter((file) => !file.endsWith('.stories.js') && !file.endsWith('.test.js'))
    .map((file) => {
      const normalized = file.replace(/\\/g, '/');
      const name = normalized.split('/').slice(-2, -1)[0];
      return [name, fileURLToPath(new URL(normalized, import.meta.url))];
    })
);

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.js'],
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    lib: {
      entry: componentEntries,
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}/${entryName}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Coloca cada CSS junto a su componente:
          // dist/button/button.css, dist/modal/modal.css…
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? 'asset';
          const componentName = name.replace(/\.css$/, '');
          return `${componentName}/${name}`;
        },
      },
    },
  },
});
