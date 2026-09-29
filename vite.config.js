import { defineConfig } from 'vite';

/**
 * Configuración de Vite para Vitest (`npm run test`).
 *
 * La librería NO se compila con `vite build`: un único build con varios
 * "entries" (uno por componente) hace que Rollup comparta código entre
 * ellos en chunks aparte, con imports relativos entre carpetas de
 * dist/ — justo lo que rompe la independencia de cada
 * dist/<componente>/. `npm run build` ejecuta en su lugar
 * scripts/build-components.mjs, que llama a la API de Vite una vez por
 * componente para que cada dist/<componente>/<componente>.js quede
 * autónomo. Ver ese script para el detalle.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.js'],
  },
});
