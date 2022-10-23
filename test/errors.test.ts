import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

const tsErrors = (code: string) => {
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('test.ts', `import {expectTypeOf} from './src'\n\n${code}`)
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = project.formatDiagnosticsWithColorAndContext(diagnostics)
  return stripAnsi(formatted)
}

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test.ts:3:36 - error TS2344: Type '{ a: string; }' does not satisfy the constraint 'Mismatch<{ a: number; }>'.
      Type '{ a: string; }' is not assignable to type '{ a: number; }'.
        Types of property 'a' are incompatible.
          Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test.ts:3:37 - error TS2322: Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                          ~

      test.ts:3:15
        3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type 'Mismatch<{ a: number; }>'
    "
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test.ts:3:36 - error TS2344: Type '{ a: string; }' does not satisfy the constraint 'Mismatch<{ a: number; }>'.
      Type '{ a: string; }' is not assignable to type '{ a: number; }'.
        Types of property 'a' are incompatible.
          Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test.ts:3:37 - error TS2322: Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                                          ~

      test.ts:3:15
        3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type 'Mismatch<{ a: number; }>'
    "
  `)
})
