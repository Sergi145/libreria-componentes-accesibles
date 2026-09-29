#!/usr/bin/env node
/**
 * Hook PostToolUse (Write|Edit): formatea con Prettier el archivo que
 * Claude acaba de crear o editar. No usa jq (no está instalado en este
 * entorno) — parsea el JSON de stdin con Node, que el proyecto ya usa.
 */
import { execSync } from 'node:child_process';

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

  // npx solo se resuelve vía shell en Windows (es un .cmd); execSync ya
  // ejecuta a través de un shell, así que la ruta va entre comillas en
  // vez de pasarla como argumento aparte (evita el aviso de Node sobre
  // args + shell:true sin escapar).
  try {
    execSync(`npx prettier --write --ignore-unknown "${filePath}"`, {
      stdio: 'ignore',
    });
  } catch {
    // No bloquea el flujo si Prettier falla (p. ej. sintaxis inválida
    // a mitad de edición); el propio "npm run check" lo detectará.
  }
});
