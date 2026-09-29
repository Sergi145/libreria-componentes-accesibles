/**
 * Compila cada componente como su propio punto de entrada de Vite,
 * ejecutando un build independiente por componente en vez de un único
 * build con varios "entries".
 *
 * Con varios entries en un mismo build, Rollup factoriza el código que
 * comparten dos o más de ellos (utilidades como rovingTabindex, o
 * Disclosure, que Navbar importa) en chunks aparte e importados entre
 * archivos de dist/ con rutas relativas ("../disclosure/disclosure.js",
 * "../roving-tabindex-XXXX.js") — justo lo que rompe la independencia
 * de cada dist/<componente>/: copiar solo esa carpeta dejaría un
 * import roto. Un build por componente obliga a Rollup a incluir esas
 * dependencias dentro del único archivo de salida.
 *
 * Genera dist/<componente>/<componente>.js (ESM). El .css y el .html
 * de referencia de cada componente los copia después
 * scripts/copy-assets.mjs (ningún .js de componente importa su propio
 * .css: los estilos se enlazan aparte con <link>).
 */
import { build } from 'vite';
import { globSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = path.join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });

const entries = globSync('src/components/*/*.js', { cwd: root }).filter(
  (file) => !file.endsWith('.stories.js') && !file.endsWith('.test.js')
);

for (const relativeEntry of entries) {
  const entryPath = path.join(root, relativeEntry);
  const name = path.basename(path.dirname(entryPath));

  await build({
    root,
    configFile: false,
    logLevel: 'warn',
    build: {
      outDir: path.join(distDir, name),
      emptyOutDir: false,
      lib: {
        entry: entryPath,
        formats: ['es'],
        fileName: () => `${name}.js`,
      },
    },
  });

  console.log(`compilado dist/${name}/${name}.js`);
}
