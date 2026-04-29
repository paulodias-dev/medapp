import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(process.cwd());
const sourcePath = path.join(projectRoot, 'public', '.htaccess');
const distDir = path.join(projectRoot, 'dist');
const destinationPath = path.join(distDir, '.htaccess');

try {
  const contents = await readFile(sourcePath, 'utf8');
  await mkdir(distDir, { recursive: true });
  await writeFile(destinationPath, contents, 'utf8');
} catch (error) {
  console.error('[copy-htaccess] Falha ao copiar .htaccess para dist/.htaccess');
  console.error(error);
  process.exitCode = 1;
}
