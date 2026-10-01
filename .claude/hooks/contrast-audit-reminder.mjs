#!/usr/bin/env node
/**
 * Hook PostToolUse (Write|Edit): si el archivo tocado es el CSS de un
 * componente (src/components/**\/*.css), añade contexto para que
 * Claude se acuerde de invocar al subagente contrast-auditor antes de dar
 * el componente por terminado. Usa node:path (no jq, no está instalado en
 * este entorno) para no depender del separador de rutas de Windows.
 */
import path from 'node:path';

let data = '';
process.stdin.on('data', (chunk) => {
  data += chunk;
});

process.stdin.on('end', () => {
  let filePath;
  try {
    const input = JSON.parse(data);
    filePath = input.tool_input?.file_path;
  } catch {
    return;
  }
  if (!filePath) return;

  const relPath = path.relative(process.cwd(), path.resolve(filePath));
  const segments = relPath.split(path.sep);
  const idx = segments.indexOf('components');
  const isComponentFile =
    idx > 0 &&
    segments[idx - 1] === 'src' &&
    segments.length > idx + 2 &&
    /\.css$/.test(segments[segments.length - 1]);

  if (!isComponentFile) return;

  const componentName = segments[idx + 1];
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `Se ha creado o modificado "${relPath.split(path.sep).join('/')}" (componente "${componentName}"). Cuando termines de trabajar en este componente, invoca al subagente contrast-auditor (Agent tool, subagent_type: "contrast-auditor") para auditar su contraste WCAG 2.2 AA en tema claro y oscuro antes de darlo por terminado.`,
    },
  };
  process.stdout.write(JSON.stringify(output));
});
