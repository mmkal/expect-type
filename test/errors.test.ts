import {createHash} from 'node:crypto'
import * as fs from 'node:fs'
import * as tsmorph from 'ts-morph'
import {test, expect} from 'vitest'
import {tsErrors, tsFileErrors, tsFilesErrors} from './ts-output'

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

test('toEqualTypeOf with optional properties on actual type', async () => {
  // ideally the error would report both problems: `x` is optional but isn't supposed to be, and `y` has type 1 but should be 2.
  // but sadly we only report the first problem.
  expect(tsErrors(`expectTypeOf<{x?: 1; y: 1}>().toEqualTypeOf<{x: 1; y: 2}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ x: 1; y: 2; }' does not satisfy the constraint '{ x: "Expected: literal number: 1, Actual: undefined"; y: "Expected: literal number: 2, Actual: literal number: 1"; }'.
      Types of property 'x' are incompatible.
        Type '1' is not assignable to type '"Expected: literal number: 1, Actual: undefined"'.

    999 expectTypeOf<{x?: 1; y: 1}>().toEqualTypeOf<{x: 1; y: 2}>()
                                                    ~~~~~~~~~~~~"
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
        Type '1' is not assignable to type 'never'.

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

const originalUsageTestFile = fs.readFileSync(__dirname + '/usage.test.ts', 'utf8')
const usageTestSourceFile = new tsmorph.Project({useInMemoryFileSystem: true}).createSourceFile(
  '/usage.test.ts',
  originalUsageTestFile,
)

const usageTests = usageTestSourceFile
  .getDescendantsOfKind(tsmorph.SyntaxKind.CallExpression)
  .filter(callExpression => callExpression.getExpression().getText() === 'test')
  .map(callExpression => {
    const [titleNode, callbackNode] = callExpression.getArguments()
    if (!tsmorph.Node.isStringLiteral(titleNode) && !tsmorph.Node.isNoSubstitutionTemplateLiteral(titleNode)) {
      throw new Error(`Expected usage.test.ts test title to be a string literal: ${callExpression.getText()}`)
    }
    if (!tsmorph.Node.isArrowFunction(callbackNode) && !tsmorph.Node.isFunctionExpression(callbackNode)) {
      throw new Error(`Expected usage.test.ts test body to be a function: ${callExpression.getText()}`)
    }
    const callbackBody = callbackNode.getBody()
    if (!tsmorph.Node.isBlock(callbackBody)) {
      throw new Error(`Expected usage.test.ts test body to be a block: ${callExpression.getText()}`)
    }
    const blockText = callbackBody.getText()
    const body = blockText.slice(1, -1).replace(/^\n/, '').replace(/\n$/, '')
    const title = titleNode.getLiteralText()
    const slug = title
      .toLowerCase()
      .split(/\W/)
      .filter(Boolean)
      .slice(0, 4)
      .concat(createHash('sha256').update(title).digest('hex').slice(0, 8))
      .join('-')

    return {title, body, slug, filepath: `test/usage-sabotaged-${slug}.ts`}
  })

const sabotageUsageTestBody = (body: string) =>
  body
    .split('\n')
    .map(line => line.replace('// @ts-expect-error', '// error expected on next line:'))
    .map(line => line.replace('.not.', '.'))
    .join('\n')

const splitUsageTestErrors = (errors: string) => {
  const errorsByFilepath = new Map<string, string[]>()
  const usageTestErrorPattern =
    /(test\/usage-sabotaged-.*\.ts:\d+:\d+ - error TS\d+:[\S\s]*?)(?=\ntest\/usage-sabotaged-.*\.ts:\d+:\d+ - error TS\d+:|$)/g
  for (const [errorBody] of errors.matchAll(usageTestErrorPattern)) {
    const filepath = errorBody.split(':', 1)[0]
    const filepathErrors = errorsByFilepath.get(filepath) || []
    filepathErrors.push(errorBody.trim())
    errorsByFilepath.set(filepath, filepathErrors)
  }
  return errorsByFilepath
}

test(`usage.test.ts`, () => {
  const originalErrors = tsFileErrors({filepath: 'test/usage.test.ts', content: originalUsageTestFile})
  // eslint-disable-next-line vitest/valid-expect
  expect(originalErrors, `unmodified usage.test.ts should not have any errors`).toEqual('')

  const errors = tsFilesErrors(
    usageTests.map(usageTest => ({
      filepath: usageTest.filepath,
      content: `import {expectTypeOf} from '../src/index'\n${sabotageUsageTestBody(usageTest.body)}\n`,
    })),
  )

  const errorsByFilepath = splitUsageTestErrors(errors)
  expect(errorsByFilepath.size).toBeGreaterThan(0)

  for (const usageTest of usageTests) {
    const testErrors = errorsByFilepath.get(usageTest.filepath)
    if (testErrors) {
      expect(testErrors.join('\n')).toMatchSnapshot(usageTest.title)
    }
  }
})
