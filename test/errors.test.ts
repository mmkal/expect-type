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
    "test.ts:3:22 - error TS2554: Expected 1 arguments, but got 0.

    3 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:118:16
        118     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test.ts:3:36 - error TS2345: Argument of type '{ a: string; }' is not assignable to parameter of type 'never'.

    3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                         ~~~~~~~~~~
    "
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test.ts:3:22 - error TS2554: Expected 1 arguments, but got 0.

    3 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:114:16
        114     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test.ts:3:22 - error TS2554: Expected 2 arguments, but got 1.

    3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                           ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:115:36
        115     <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>): true
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})
