import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

export const tsErrors = (...lines: string[]) => {
  const code = lines.join('\n')
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('./test/test.ts', `import {expectTypeOf} from '../src'\n\n${code}`)
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = project.formatDiagnosticsWithColorAndContext(diagnostics)
  return simplifyTsOutput(formatted)
}

export const simplifyTsOutput = (output: string) =>
  stripAnsi(output)
    // replace digits in line numbers with 9s so snapshots don't change all the time
    .replace(/:\d+:\d+/g, s => s.replace(/\d/g, '9'))
    .replace(/^\s+\d+/gm, s => s.replace(/\d/g, '9'))
