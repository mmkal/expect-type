import * as tsmorph from 'ts-morph'

const tsErrors = (code: string) => {
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('test.ts', `import {expectTypeOf} from './src'\n\n${code}`)
  const diagnostics = project.getPreEmitDiagnostics()
  return diagnostics.map(d => d.getMessageText())
}

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    Array [
      "Expected 1 arguments, but got 0.",
    ]
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    Array [
      "Argument of type '{ a: string; }' is not assignable to parameter of type 'never'.",
    ]
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    Array [
      "Expected 1 arguments, but got 0.",
    ]
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    Array [
      "Expected 2 arguments, but got 1.",
    ]
  `)
})
