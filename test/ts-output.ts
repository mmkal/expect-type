import * as path from 'path'
import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

export const tsErrors = (...lines: string[]) => {
  const body = lines.join('\n')
  return tsFileErrors({filepath: './test/test.ts', content: `import {expectTypeOf} from '../src'\n\n${body}`})
}

export const tsFileErrors = (params: {filepath: string; content: string}) => {
  const project = new tsmorph.Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
    libFolderPath: path.resolve(__dirname, '../node_modules/typescript/lib'),
  })
  project.addSourceFileAtPath('./src/index.ts')
  // Add 100 lines to the beginning so all line numbers have three digits. Later when we call `simplifyTsOutput` we replace all line numbers with 999 so if they don't have three digits it messes up typescript's squiggly underlines slightly.
  // Note: if the file being tested runs over 1000 lines this will break down.
  project.createSourceFile(params.filepath, '\n'.repeat(100) + params.content, {overwrite: true})
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = project.formatDiagnosticsWithColorAndContext(diagnostics)
  return simplifyTsOutput(formatted)
}

export const simplifyTsOutput = (output: string) =>
  stripAnsi(output)
    // replace digits in line numbers with 9s so snapshots don't change all the time
    .replace(/:\d+:\d+/g, s => s.replace(/\d+/g, '999'))
    .replace(/^\s*\d+/gm, s => s.replace(/\d+/g, '999'))
    .trim()
