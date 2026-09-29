/**
 * Tras `vite build`, copia el .css y el .html de referencia de cada
 * componente junto a su .js compilado, para que dist/<componente>/
 * quede como un paquete independiente y completo (html + css + js).
 */
import { cpSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const componentsDir = join(root, 'src', 'components');
const distDir = join(root, 'dist');

const components = readdirSync(componentsDir).filter((name) =>
  statSync(join(componentsDir, name)).isDirectory()
);

for (const name of components) {
  const srcDir = join(componentsDir, name);
  const destDir = join(distDir, name);

  for (const ext of ['css', 'html']) {
    const file = `${name}.${ext}`;
    try {
      cpSync(join(srcDir, file), join(destDir, file));
      console.log(`copiado dist/${name}/${file}`);
    } catch {
      // El componente puede no tener ese archivo; se ignora.
    }
  }
}
