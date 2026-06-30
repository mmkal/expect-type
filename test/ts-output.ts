import * as path from 'node:path'
import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

export const tsErrors = (...lines: string[]) => {
  const body = lines.join('\n')
  return tsFileErrors({filepath: './test/test.ts', content: `import {expectTypeOf} from '../src'\n\n${body}`})
}

export const tsFileErrors = (params: {filepath: string; content: string; realLineNumbers?: boolean}) => {
  const content = params.realLineNumbers ? params.content : '\n'.repeat(100) + params.content
  const formatted = tsFilesErrors([{filepath: params.filepath, content}])
  return params.realLineNumbers ? formatted : simplifyTsOutput(formatted)
}

export const tsFilesErrors = (files: Array<{filepath: string; content: string}>) => {
  const project = new tsmorph.Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
    libFolderPath: path.resolve(__dirname, '../node_modules/typescript/lib'),
    skipAddingFilesFromTsConfig: true,
  })
  project.addSourceFileAtPath('./src/index.ts')
  for (const file of files) {
    project.createSourceFile(file.filepath, file.content, {overwrite: true})
  }
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = stripAnsi(project.formatDiagnosticsWithColorAndContext(diagnostics))
  return stripAnsi(formatted).trim()
}

export const simplifyTsOutput = (output: string) =>
  stripAnsi(output)
    // replace digits in line numbers with 9s so snapshots don't change all the time
    .replaceAll(/:\d+:\d+/g, s => s.replaceAll(/\d+/g, '999'))
    .replaceAll(/^\s*\d+/gm, s => s.replaceAll(/\d+/g, '999'))
    .trim()
