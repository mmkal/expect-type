import * as fs from 'fs'
import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'
import {tsErrors, simplifyTsOutput} from './ts-output'

test('toBeIdenticalTo error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toBeIdenticalTo<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    9 expectTypeOf({a: 1}).toBeIdenticalTo<{a: string}>()
                                           ~~~~~~~~~~~
    "
  `)
})

test('toBeIdenticalTo special types', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: any}>().toBeIdenticalTo<{a: 1}>()`,
      `expectTypeOf<{a: never}>().toBeIdenticalTo<{a: 1}>()`,
      `expectTypeOf<{a: unknown}>().toBeIdenticalTo<{a: 1}>()`,
      `expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: any}>()`,
      `expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: never}>()`,
      `expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: unknown}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type 'never'.

    9 expectTypeOf<{a: any}>().toBeIdenticalTo<{a: 1}>()
                                               ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: never\\"'.

    9 expectTypeOf<{a: never}>().toBeIdenticalTo<{a: 1}>()
                                                 ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: unknown\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: unknown\\"'.

    9 expectTypeOf<{a: unknown}>().toBeIdenticalTo<{a: 1}>()
                                                   ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: any; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'any' is not assignable to type 'never'.

    9 expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: any}>()
                                             ~~~~~~~~
    test/test.ts:9:99 - error TS2554: Expected 1 arguments, but got 0.

    9 expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: never}>()
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/test.ts:9:99 - error TS2344: Type '{ a: unknown; }' does not satisfy the constraint '{ a: \\"Expected: unknown, Actual: literal number: 1\\"; }'.
      Types of property 'a' are incompatible.
        Type 'unknown' is not assignable to type '\\"Expected: unknown, Actual: literal number: 1\\"'.

    9 expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: unknown}>()
                                             ~~~~~~~~~~~~
    "
  `)
})

test('toBeIdenticalTo with literals', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: string}>().toBeIdenticalTo<{a: 'abc'}>()`,
      `expectTypeOf<{a: 'abc'}>().toBeIdenticalTo<{a: string}>()`,
      `expectTypeOf<{a: 'abc'}>().toBeIdenticalTo<{a: 'xyz'}>()`,
      `expectTypeOf<{a: number}>().toBeIdenticalTo<{a: 1}>()`,
      `expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: number}>()`,
      `expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: 2}>()`,
      `expectTypeOf<{a: boolean}>().toBeIdenticalTo<{a: true}>()`,
      `expectTypeOf<{a: true}>().toBeIdenticalTo<{a: boolean}>()`,
      `expectTypeOf<{a: true}>().toBeIdenticalTo<{a: false}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: \\"abc\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: abc, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"abc\\"' is not assignable to type '\\"Expected: literal string: abc, Actual: string\\"'.

    9 expectTypeOf<{a: string}>().toBeIdenticalTo<{a: 'abc'}>()
                                                  ~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: literal string: abc\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: literal string: abc\\"'.

    9 expectTypeOf<{a: 'abc'}>().toBeIdenticalTo<{a: string}>()
                                                 ~~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: \\"xyz\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: xyz, Actual: literal string: abc\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"xyz\\"' is not assignable to type '\\"Expected: literal string: xyz, Actual: literal string: abc\\"'.

    9 expectTypeOf<{a: 'abc'}>().toBeIdenticalTo<{a: 'xyz'}>()
                                                 ~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: number\\"'.

    9 expectTypeOf<{a: number}>().toBeIdenticalTo<{a: 1}>()
                                                  ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: literal number: 1\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: literal number: 1\\"'.

    9 expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: number}>()
                                             ~~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 2; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 2, Actual: literal number: 1\\"; }'.
      Types of property 'a' are incompatible.
        Type '2' is not assignable to type '\\"Expected: literal number: 2, Actual: literal number: 1\\"'.

    9 expectTypeOf<{a: 1}>().toBeIdenticalTo<{a: 2}>()
                                             ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: true; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"; }'.
      Types of property 'a' are incompatible.
        Type 'true' is not assignable to type '\\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"'.

    9 expectTypeOf<{a: boolean}>().toBeIdenticalTo<{a: true}>()
                                                   ~~~~~~~~~
    test/test.ts:99:99 - error TS2344: Type '{ a: boolean; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Types of property 'a' are incompatible.
        Type 'boolean' is not assignable to type '\\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"'.

    99 expectTypeOf<{a: true}>().toBeIdenticalTo<{a: boolean}>()
                                                 ~~~~~~~~~~~~
    test/test.ts:99:99 - error TS2344: Type '{ a: false; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Types of property 'a' are incompatible.
        Type 'false' is not assignable to type '\\"Expected: literal boolean: false, Actual: literal boolean: true\\"'.

    99 expectTypeOf<{a: true}>().toBeIdenticalTo<{a: false}>()
                                                 ~~~~~~~~~~
    "
  `)
})

test('toExtend error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toExtend<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    9 expectTypeOf({a: 1}).toExtend<{a: string}>()
                                    ~~~~~~~~~~~
    "
  `)
})

test('usage.test.ts', () => {
  // remove all `.not`s and `// @ts-expect-error`s from the main test file and snapshot the errors
  const usageTestFile = fs
    .readFileSync(__filename.replace('errors.test.ts', 'usage.test.ts'))
    .toString()
    .split('\n')
    .map(line => line.replace('// @ts-expect-error', '// error expected on next line:'))
    .map(line => line.replace('.not.', '.'))
    .join('\n')
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('./test/usage.test.ts', usageTestFile, {overwrite: true})
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = stripAnsi(project.formatDiagnosticsWithColorAndContext(diagnostics))

  expect(simplifyTsOutput(formatted)).toMatchInlineSnapshot(`
    "test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: never, Actual: number\\"; }'.
      Property 'b' is missing in type '{ a: number; }' but required in type '{ a: number; b: \\"Expected: never, Actual: number\\"; }'.

    99   expectTypeOf({a: 1, b: 1}).toBeIdenticalTo<{a: number}>()
                                                    ~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; b: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'b' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    99   expectTypeOf({a: 1}).toBeIdenticalTo<{a: number; b: number}>()
                                              ~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; b: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'b' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    99   expectTypeOf({a: 1}).toExtend<{a: number; b: number}>()
                                       ~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Apple' does not satisfy the constraint '{ type: \\"Fruit\\"; name: \\"Expected: literal string: Apple, Actual: never\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"; }'.
      Types of property 'name' are incompatible.
        Type '\\"Apple\\"' is not assignable to type '\\"Expected: literal string: Apple, Actual: never\\"'.

    99   expectTypeOf<Fruit>().toExtend<Apple>()
                                        ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ type: \\"Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ type: \\"Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.

    99   expectTypeOf<Apple>().toBeIdenticalTo<Fruit>()
                                               ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ b: number; }' does not satisfy the constraint '{ a: \\"Expected: never, Actual: number\\"; b: \\"Expected: number, Actual: never\\"; }'.
      Property 'a' is missing in type '{ b: number; }' but required in type '{ a: \\"Expected: never, Actual: number\\"; b: \\"Expected: number, Actual: never\\"; }'.

    99   expectTypeOf({a: 1}).toExtend<{b: number}>()
                                       ~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Apple' does not satisfy the constraint '{ type: \\"Fruit\\"; name: \\"Expected: literal string: Apple, Actual: never\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"; }'.
      Types of property 'name' are incompatible.
        Type '\\"Apple\\"' is not assignable to type '\\"Expected: literal string: Apple, Actual: never\\"'.

    99   expectTypeOf<Fruit>().toExtend<Apple>()
                                        ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ type: \\"Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ type: \\"Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.

    99   expectTypeOf<Apple>().toBeIdenticalTo<Fruit>()
                                               ~~~~~
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2344: Type '{ deeply: { nested: unknown; }; }' does not satisfy the constraint '{ deeply: { nested: never; }; }'.
      The types of 'deeply.nested' are incompatible between these types.
        Type 'unknown' is not assignable to type 'never'.

    99   expectTypeOf<{deeply: {nested: any}}>().toBeIdenticalTo<{deeply: {nested: unknown}}>()
                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(undefined).toBeNullable()
                                 ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(null).toBeNullable()
                            ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<1 | undefined>().toBeNullable()
                                       ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<1 | null>().toBeNullable()
                                  ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<1 | undefined | null>().toBeNullable()
                                              ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeUnknown()
                         ~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeAny()
                         ~~~~~~~~~

      src/index.ts:999:99
        999   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeNever()
                         ~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeNull()
                         ~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:99 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeUndefined()
                         ~~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type 'number' does not satisfy the constraint '\\"Expected: number, Actual: string\\" | \\"Expected: number, Actual: number\\"'.

    999   expectTypeOf<string | number>().toExtend<number>()
                                                   ~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 2 arguments, but got 1.

    999   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 2 arguments, but got 1.

    999   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type 'HasParam' does not satisfy the constraint '\\"Expected: function, Actual: function\\"'.

    999   expectTypeOf<NoParam>().toBeIdenticalTo<HasParam>()
                                                  ~~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf(f).toBeAny()
                          ~~~~~~~~~

      src/index.ts:999:99
        999   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~~~

      src/index.ts:999:99
        999   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type 'string' does not satisfy the constraint '\\"Expected: string, Actual: number\\"'.

    999   expectTypeOf(f).parameter(0).toBeIdenticalTo<string>()
                                                       ~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '(this: { name: string; }, message: string) => string' does not satisfy the constraint '\\"Expected: function, Actual: function\\"'.

    999   expectTypeOf(greetFormal).toBeIdenticalTo<typeof greetCasual>()
                                                    ~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~~~

      src/index.ts:999:99
        999   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: string\\"'.

    999   expectTypeOf<{a: string}>().toBeIdenticalTo<{a: number}>()
                                                      ~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    999   expectTypeOf<{a?: number}>().toBeIdenticalTo<{a: number}>()
                                                       ~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    999   expectTypeOf<{a?: number}>().toBeIdenticalTo<{a: number | undefined}>()
                                                       ~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    999   expectTypeOf<{a?: number | null}>().toBeIdenticalTo<{a: number | null}>()
                                                              ~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<A1>().toBeIdenticalTo<E1>()
                             ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<A2>().toBeIdenticalTo<E2>()
                             ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<typeof A>().toBeIdenticalTo<typeof B>()
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})
