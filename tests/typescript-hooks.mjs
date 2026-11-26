import { readFileSync } from 'node:fs';
import ts from 'typescript';

const sourceRoot = new URL('../src/', import.meta.url);

export function resolve(specifier, context, next) {
  // Next.js enforces this marker. The tests run the server modules directly.
  if (specifier === 'server-only') return next('data:text/javascript,export%20%7B%7D', context);
  if (specifier.startsWith('@/')) {
    return next(new URL(`${specifier.slice(2)}.ts`, sourceRoot).href, context);
  }
  if (context.parentURL?.startsWith(sourceRoot.href) && specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
    return next(`${specifier}.ts`, context);
  }
  return next(specifier, context);
}

export function load(url, context, next) {
  if (!url.startsWith(sourceRoot.href) || !url.endsWith('.ts')) return next(url, context);
  const source = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return { format: 'module', source, shortCircuit: true };
}
