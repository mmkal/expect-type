import * as fs from 'node:fs'
import {test, expect} from 'vitest'
import {tsErrors, tsFileErrors} from './ts-output'

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: "Expected: string, Actual: number"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '"Expected: string, Actual: number"'.

    999 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                                           ~~~~~~~~~~~"
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2353: Object literal may only specify known properties, and 'a' does not exist in type 'Mismatch'.

    999 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                            ~"
  `)
})

test('toEqualTypeOf with optional properties', async () => {
  expect(tsErrors(`expectTypeOf<{x?: 1; y: 1}>().toEqualTypeOf<{x?: 1; y: 2}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ x?: 1 | undefined; y: 2; }' does not satisfy the constraint '{ y: "Expected: literal number: 2, Actual: literal number: 1"; x?: 1 | undefined; }'.
      Types of property 'y' are incompatible.
        Type '2' is not assignable to type '"Expected: literal number: 2, Actual: literal number: 1"'.

    999 expectTypeOf<{x?: 1; y: 1}>().toEqualTypeOf<{x?: 1; y: 2}>()
                                                    ~~~~~~~~~~~~~"
  `)
})

test('toEqualTypeOf special types', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: any}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: 1}>().toEqualTypeOf<{a: any}>()`,
      `expectTypeOf<{a: 1}>().toEqualTypeOf<{a: never}>()`,
      `expectTypeOf<{a: 1}>().toEqualTypeOf<{a: unknown}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type 'never'.

    999 expectTypeOf<{a: any}>().toEqualTypeOf<{a: 1}>()
                                               ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: "Expected: literal number: 1, Actual: never"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '"Expected: literal number: 1, Actual: never"'.

    999 expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()
                                                 ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: "Expected: literal number: 1, Actual: unknown"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '"Expected: literal number: 1, Actual: unknown"'.

    999 expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()
                                                   ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: any; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'any' is not assignable to type 'never'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: any}>()
                                             ~~~~~~~~
    test/test.ts:999:999 - error TS2554: Expected 1 arguments, but got 0.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: never}>()
                               ~~~~~~~~~~~~~

      src/index.ts:999:999
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/test.ts:999:999 - error TS2344: Type '{ a: unknown; }' does not satisfy the constraint '{ a: "Expected: unknown, Actual: never"; }'.
      Types of property 'a' are incompatible.
        Type 'unknown' is not assignable to type '"Expected: unknown, Actual: never"'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: unknown}>()
                                             ~~~~~~~~~~~~"
  `)
})

test('toEqualTypeOf with literals', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'abc'}>()`,
      `expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: string}>()`,
      `expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: 'xyz'}>()`,
      `expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: 1}>().toEqualTypeOf<{a: number}>()`,
      `expectTypeOf<{a: 1}>().toEqualTypeOf<{a: 2}>()`,
      `expectTypeOf<{a: boolean}>().toEqualTypeOf<{a: true}>()`,
      `expectTypeOf<{a: true}>().toEqualTypeOf<{a: boolean}>()`,
      `expectTypeOf<{a: true}>().toEqualTypeOf<{a: false}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: "abc"; }' does not satisfy the constraint '{ a: "Expected: literal string: abc, Actual: string"; }'.
      Types of property 'a' are incompatible.
        Type '"abc"' is not assignable to type '"Expected: literal string: abc, Actual: string"'.

    999 expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'abc'}>()
                                                  ~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: "Expected: string, Actual: never"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '"Expected: string, Actual: never"'.

    999 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: string}>()
                                                 ~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: "xyz"; }' does not satisfy the constraint '{ a: "Expected: literal string: xyz, Actual: literal string: abc"; }'.
      Types of property 'a' are incompatible.
        Type '"xyz"' is not assignable to type '"Expected: literal string: xyz, Actual: literal string: abc"'.

    999 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: 'xyz'}>()
                                                 ~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: "Expected: literal number: 1, Actual: number"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '"Expected: literal number: 1, Actual: number"'.

    999 expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()
                                                  ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: "Expected: number, Actual: never"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '"Expected: number, Actual: never"'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: number}>()
                                             ~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 2; }' does not satisfy the constraint '{ a: "Expected: literal number: 2, Actual: literal number: 1"; }'.
      Types of property 'a' are incompatible.
        Type '2' is not assignable to type '"Expected: literal number: 2, Actual: literal number: 1"'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: 2}>()
                                             ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: true; }' does not satisfy the constraint '{ a: "Expected: literal boolean: true, Actual: literal boolean: false"; }'.
      Types of property 'a' are incompatible.
        Type 'true' is not assignable to type '"Expected: literal boolean: true, Actual: literal boolean: false"'.

    999 expectTypeOf<{a: boolean}>().toEqualTypeOf<{a: true}>()
                                                   ~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: boolean; }' does not satisfy the constraint '{ a: "Expected: boolean, Actual: never"; }'.
      Types of property 'a' are incompatible.
        Type 'boolean' is not assignable to type '"Expected: boolean, Actual: never"'.

    999 expectTypeOf<{a: true}>().toEqualTypeOf<{a: boolean}>()
                                                ~~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: false; }' does not satisfy the constraint '{ a: "Expected: literal boolean: false, Actual: literal boolean: true"; }'.
      Types of property 'a' are incompatible.
        Type 'false' is not assignable to type '"Expected: literal boolean: false, Actual: literal boolean: true"'.

    999 expectTypeOf<{a: true}>().toEqualTypeOf<{a: false}>()
                                                ~~~~~~~~~~"
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: "Expected: string, Actual: number"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '"Expected: string, Actual: number"'.

    999 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                                           ~~~~~~~~~~~"
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2554: Expected 0 arguments, but got 1.

    999 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                                           ~~~~~~~~~~"
  `)
})

test('toBeString', async () => {
  const badString = `expectTypeOf(1).toBeString()`
  expect(tsErrors(badString)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2349: This expression is not callable.
      Type 'ExpectString<number>' has no call signatures.

    999 expectTypeOf(1).toBeString()
                        ~~~~~~~~~~"
  `)
})

test('toBeNullable', async () => {
  const okAssertion = `expectTypeOf<1 | undefined>().toBeNullable()`
  expect(tsErrors(okAssertion + '\n' + okAssertion.replace('.toBe', '.not.toBe'))).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2349: This expression is not callable.
      Type 'Inverted<ExpectNullable<1 | undefined>>' has no call signatures.

    999 expectTypeOf<1 | undefined>().not.toBeNullable()
                                          ~~~~~~~~~~~~"
  `)
})

test('toEqualTypeOf with tuples', () => {
  const assertion = `expectTypeOf<[[number], [1], []]>().toEqualTypeOf<[[number], [2], []]>()`
  expect(tsErrors(assertion)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '[[number], [2], []]' does not satisfy the constraint '{ 0: { 0: number; }; 1: { 0: "Expected: literal number: 2, Actual: literal number: 1"; }; 2: {}; }'.
      The types of '1[0]' are incompatible between these types.
        Type '2' is not assignable to type '"Expected: literal number: 2, Actual: literal number: 1"'.

    999 expectTypeOf<[[number], [1], []]>().toEqualTypeOf<[[number], [2], []]>()
                                                          ~~~~~~~~~~~~~~~~~~~"
  `)
})

test('toMatchObjectType', () => {
  expect(tsErrors(`expectTypeOf({a: {b: 1}}).toMatchObjectType<{a: {b: string}}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: { b: string; }; }' does not satisfy the constraint '{ a: { b: "Expected: string, Actual: number"; }; }'.
      The types of 'a.b' are incompatible between these types.
        Type 'string' is not assignable to type '"Expected: string, Actual: number"'.

    999 expectTypeOf({a: {b: 1}}).toMatchObjectType<{a: {b: string}}>()
                                                    ~~~~~~~~~~~~~~~~"
  `)
})

test('usage.test.ts', () => {
  // remove all `.not`s and `// @ts-expect-error`s from the main test file and snapshot the errors
  const usageTestFile = fs
    .readFileSync(__dirname + '/usage.test.ts')
    .toString()
    .split('\n')
    .map(line => line.replace('// @ts-expect-error', '// error expected on next line:'))
    .map(line => line.replace('.not.', '.'))
    .join('\n')
  expect(tsFileErrors({filepath: 'test/usage.test.ts', content: usageTestFile})).toMatchSnapshot()
})
