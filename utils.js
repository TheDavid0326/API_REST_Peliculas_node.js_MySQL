import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); // Proporciona la ubicación del archivo desde el que se está ejecutando el código.

export const readJSON = (path) => require(path);
