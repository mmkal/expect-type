import * as fs from 'fs'
import {tsErrors, tsFileErrors} from './ts-output'

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2554: Expected 1 arguments, but got 0.

    999 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:999
        999     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided."
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2345: Argument of type '{ a: string; }' is not assignable to parameter of type 'never'.

    999 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                           ~~~~~~~~~~"
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2554: Expected 1 arguments, but got 0.

    999 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:999
        999     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided."
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2554: Expected 2 arguments, but got 1.

    999 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                             ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:999
        999     <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided."
  `)
})

test('usage test', () => {
  // remove all `.not`s and `// @ts-expect-error`s from the main test file and snapshot the errors
  const usageTestFile = fs
    .readFileSync(__filename.replace('errors.test.ts', 'usage.test.ts'))
    .toString()
    .split('\n')
    .map(line => line.replace('// @ts-expect-error', '// error on next line:').replace('.not.', '.'))
    .join('\n')
  expect(tsFileErrors({filepath: 'test/usage.test.ts', content: usageTestFile})).toMatchSnapshot()
})
