import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'

const decoratorSyntax = /@(?:Remote|RemoteScope)\b/

/**
 * Pre-transform standard (stage-3) decorators with the TypeScript compiler:
 * vitest's esbuild pipeline does not accept the `@Remote` decorators the host
 * runtime uses, so decorator-bearing modules pass through `ts.transpileModule`
 * first — the same approach the harness's shared vitest config takes.
 */
function standardDecoratorPlugin(): Plugin {
  return {
    name: 'dsh-open-in-standard-decorators',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      const file = id.split('?', 1)[0]
      if (!/\.[cm]?tsx?$/.test(file) || !decoratorSyntax.test(code)) return
      const result = ts.transpileModule(code, {
        fileName: file,
        compilerOptions: {
          target: ts.ScriptTarget.ES2024,
          module: ts.ModuleKind.ESNext,
          jsx: file.endsWith('x') ? ts.JsxEmit.ReactJSX : undefined,
          sourceMap: true,
        },
      })
      return {
        code: result.outputText
          .replace(
            /^(\s*)(__esDecorate\()/gmu,
            '$1/* v8 ignore next -- compiler-synthetic decorator accessors have no source behavior */ $2',
          )
          .replace(/\n?\/\/# sourceMappingURL=.*$/u, '\n'),
        map: result.sourceMapText,
      }
    },
  }
}

export default defineConfig({
  plugins: [standardDecoratorPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.{ts,tsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
    server: {
      deps: {
        // ui-primitives (linked from the local dsh install) imports
        // katex/dist/katex.min.css at module level; inlining lets vite
        // intercept the CSS import (stubbed) instead of Node loading it raw.
        inline: [/@deepseek-ai\/dsh-client-ui-primitives/],
      },
    },
  },
})