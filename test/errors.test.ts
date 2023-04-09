import * as fs from 'fs'
import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

const tsErrors = (...lines: string[]) => {
  const code = lines.join('\n')
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('./test/test.ts', `import {expectTypeOf} from '../src'\n\n${code}`)
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = project.formatDiagnosticsWithColorAndContext(diagnostics)
  return stripAnsi(formatted).replace(/:\d+:\d+/g, ':999:999')
}

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    3 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
  `)
})

test('toEqualTypeOf<...>() special types', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: any}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()`,
      `expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: ...; }; }; }; }; }; }; }; }; }; }; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '{ [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: ...; }; }; }; }; }; }; }; }; }; }; }'.

    3 expectTypeOf<{a: any}>().toEqualTypeOf<{a: 1}>()
                                             ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: never\\"'.

    4 expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()
                                               ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: unknown\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: unknown\\"'.

    5 expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()
                                                 ~~~~~~
    "
  `)
})

test('toEqualTypeOf<...>() literals', async () => {
  expect(
    tsErrors(
      `expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'literalstring'}>()`,
      `expectTypeOf<{a: 'literalstring'}>().toEqualTypeOf<{a: string}>()`,
      `expectTypeOf<{a: 'literalstring'}>().toEqualTypeOf<{a: 'otherliteralstring'}>()`,
      `expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()`,
    ),
  ).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: \\"literalstring\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: literalstring, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"literalstring\\"' is not assignable to type '\\"Expected: literal string: literalstring, Actual: string\\"'.

    3 expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'literalstring'}>()
                                                ~~~~~~~~~~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: literal string: literalstring\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: literal string: literalstring\\"'.

    4 expectTypeOf<{a: 'literalstring'}>().toEqualTypeOf<{a: string}>()
                                                         ~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: \\"otherliteralstring\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: otherliteralstring, Actual: literal string: literalstring\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"otherliteralstring\\"' is not assignable to type '\\"Expected: literal string: otherliteralstring, Actual: literal string: literalstring\\"'.

    5 expectTypeOf<{a: 'literalstring'}>().toEqualTypeOf<{a: 'otherliteralstring'}>()
                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: number\\"'.

    6 expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()
                                                ~~~~~~
    "
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2322: Type '\\"one\\"' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                          ~

      test/test.ts:999:999
        3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type '{ a: \\"Expected: string, Actual: number\\"; }'
    "
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    3 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2322: Type '\\"one\\"' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                                          ~

      test/test.ts:999:999
        3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type '{ a: \\"Expected: string, Actual: number\\"; }'
    "
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
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('./test/usage.test.ts', usageTestFile, {overwrite: true})
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = stripAnsi(project.formatDiagnosticsWithColorAndContext(diagnostics))

  expect(formatted).toMatchInlineSnapshot(`
    "test/usage.test.ts:21:44 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: number\\"; b: \\"Expected: never, Actual: number\\"; }'.
      Property 'b' is missing in type '{ a: number; }' but required in type '{ a: \\"Expected: number, Actual: number\\"; b: \\"Expected: never, Actual: number\\"; }'.

    21   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                                  ~~~~~~~~~~~

      test/usage.test.ts:21:23
        21   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                 ~~~~
        'b' is declared here.
    test/usage.test.ts:30:39 - error TS2322: Type 'number' is not assignable to type '\\"Expected: number, Actual: number\\"'.

    30   expectTypeOf({a: 1}).toEqualTypeOf({a: 1, b: 1})
                                             ~

      test/usage.test.ts:30:17
        30   expectTypeOf({a: 1}).toEqualTypeOf({a: 1, b: 1})
                           ~~~~
        The expected type comes from property 'a' which is declared here on type '{ a: \\"Expected: number, Actual: number\\"; }'
    test/usage.test.ts:32:39 - error TS2322: Type 'number' is not assignable to type '\\"Expected: number, Actual: number\\"'.

    32   expectTypeOf({a: 1}).toMatchTypeOf({a: 1, b: 1})
                                             ~

      test/usage.test.ts:32:17
        32   expectTypeOf({a: 1}).toMatchTypeOf({a: 1, b: 1})
                           ~~~~
        The expected type comes from property 'a' which is declared here on type '{ a: \\"Expected: number, Actual: number\\"; }'
    test/usage.test.ts:42:39 - error TS2344: Type 'Apple' does not satisfy the constraint '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"; }'.
      Types of property 'type' are incompatible.
        Type '\\"Fruit\\"' is not assignable to type '\\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"'.

    42   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~
    test/usage.test.ts:45:39 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.

    45   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:37:32
        37   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:49:39 - error TS2345: Argument of type '{ b: number; }' is not assignable to parameter of type '{ a: \\"Expected: never, Actual: number\\"; }'.
      Object literal may only specify known properties, and 'b' does not exist in type '{ a: \\"Expected: never, Actual: number\\"; }'.

    49   expectTypeOf({a: 1}).toMatchTypeOf({b: 1})
                                             ~~~~
    test/usage.test.ts:58:39 - error TS2344: Type 'Apple' does not satisfy the constraint '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\" | \\"Expected: literal boolean: true, Actual: literal boolean: true\\"; }'.
      Types of property 'type' are incompatible.
        Type '\\"Fruit\\"' is not assignable to type '\\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"'.

    58   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~
    test/usage.test.ts:59:39 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ type: \\"Expected: literal string: Fruit, Actual: literal string: Fruit\\"; name: \\"Expected: never, Actual: literal string: Apple\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: true\\" | \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.

    59   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:54:32
        54   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:68:25 - error TS2554: Expected 1 arguments, but got 0.

    68   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~~~

      src/index.ts:164:16
        164   toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:72:57 - error TS2344: Type '{ deeply: { nested: unknown; }; }' does not satisfy the constraint '{ deeply: { nested: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: ...; }; }; }; }; }; }; }; }; }; }; }'.
      The types of 'deeply.nested' are incompatible between these types.
        Type 'unknown' is not assignable to type '{ [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: { [x: string]: ...; }; }; }; }; }; }; }; }; }; }; }'.
          Index signature for type 'string' is missing in type '{}'.

    72   expectTypeOf<{deeply: {nested: any}}>().toEqualTypeOf<{deeply: {nested: unknown}}>()
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:90:27 - error TS2554: Expected 1 arguments, but got 0.

    90   expectTypeOf(undefined).toBeNullable()
                                 ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:94:22 - error TS2554: Expected 1 arguments, but got 0.

    94   expectTypeOf(null).toBeNullable()
                            ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:97:33 - error TS2554: Expected 1 arguments, but got 0.

    97   expectTypeOf<1 | undefined>().toBeNullable()
                                       ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:98:28 - error TS2554: Expected 1 arguments, but got 0.

    98   expectTypeOf<1 | null>().toBeNullable()
                                  ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:40 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<1 | undefined | null>().toBeNullable()
                                              ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:103:19 - error TS2554: Expected 1 arguments, but got 0.

    103   expectTypeOf(1).toBeUnknown()
                          ~~~~~~~~~~~~~

      src/index.ts:159:17
        159   toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:104:19 - error TS2554: Expected 1 arguments, but got 0.

    104   expectTypeOf(1).toBeAny()
                          ~~~~~~~~~

      src/index.ts:158:13
        158   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:105:19 - error TS2554: Expected 1 arguments, but got 0.

    105   expectTypeOf(1).toBeNever()
                          ~~~~~~~~~~~

      src/index.ts:160:15
        160   toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:106:19 - error TS2554: Expected 1 arguments, but got 0.

    106   expectTypeOf(1).toBeNull()
                          ~~~~~~~~~~

      src/index.ts:169:14
        169   toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:107:19 - error TS2554: Expected 1 arguments, but got 0.

    107   expectTypeOf(1).toBeUndefined()
                          ~~~~~~~~~~~~~~~

      src/index.ts:170:19
        170   toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:108:19 - error TS2554: Expected 1 arguments, but got 0.

    108   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~~~

      src/index.ts:171:18
        171   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:113:49 - error TS2344: Type 'number' does not satisfy the constraint '\\"Expected: number, Actual: number\\" | \\"Expected: number, Actual: string\\"'.

    113   expectTypeOf<string | number>().toMatchTypeOf<number>()
                                                        ~~~~~~
    test/usage.test.ts:137:71 - error TS2554: Expected 2 arguments, but got 1.

    137   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:226:5
        226     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:154:21 - error TS2554: Expected 2 arguments, but got 1.

    154   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:226:5
        226     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:159:41 - error TS2554: Expected 1 arguments, but got 0.

    159   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~~~

      src/index.ts:165:16
        165   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:166:41 - error TS2344: Type 'HasParam' does not satisfy the constraint '\\"Expected: function, Actual: function\\"'.

    166   expectTypeOf<NoParam>().toEqualTypeOf<HasParam>()
                                                ~~~~~~~~
    test/usage.test.ts:186:19 - error TS2554: Expected 1 arguments, but got 0.

    186   expectTypeOf(f).toBeAny()
                          ~~~~~~~~~

      src/index.ts:158:13
        158   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:187:27 - error TS2554: Expected 1 arguments, but got 0.

    187   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~~~

      src/index.ts:158:13
        158   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:190:46 - error TS2345: Argument of type '\\"1\\"' is not assignable to parameter of type '\\"Expected: string, Actual: number\\"'.

    190   expectTypeOf(f).parameter(0).toEqualTypeOf('1')
                                                     ~~~
    test/usage.test.ts:238:43 - error TS2345: Argument of type '(this: { name: string; }, message: string) => string' is not assignable to parameter of type '\\"Expected: function, Actual: function\\"'.

    238   expectTypeOf(greetFormal).toEqualTypeOf(greetCasual)
                                                  ~~~~~~~~~~~
    test/usage.test.ts:253:33 - error TS2554: Expected 1 arguments, but got 0.

    253   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~~~

      src/index.ts:165:16
        165   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:265:45 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: string\\"'.

    265   expectTypeOf<{a: string}>().toEqualTypeOf<{a: number}>()
                                                    ~~~~~~~~~~~
    test/usage.test.ts:270:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    270   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number}>()
                                                     ~~~~~~~~~~~
    test/usage.test.ts:271:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    271   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number | undefined}>()
                                                     ~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:272:53 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '\\"Expected: ..., Actual: unknown\\"'.

    272   expectTypeOf<{a?: number | null}>().toEqualTypeOf<{a: number | null}>()
                                                            ~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:281:36 - error TS2344: Type 'E1' does not satisfy the constraint '{ readonly a: \\"Expected: string, Actual: string\\"; b: \\"Expected: string, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: string\\"'.

    281   expectTypeOf<A1>().toEqualTypeOf<E1>()
                                           ~~
    test/usage.test.ts:287:36 - error TS2344: Type 'E2' does not satisfy the constraint '{ a: \\"Expected: string, Actual: string\\"; b: { readonly c: \\"Expected: string, Actual: string\\"; }; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: string\\"'.

    287   expectTypeOf<A2>().toEqualTypeOf<E2>()
                                           ~~
    test/usage.test.ts:304:42 - error TS2344: Type 'typeof B' does not satisfy the constraint '{ prototype: { value: \\"Expected: number, Actual: number\\"; }; }'.
      The types of 'prototype.value' are incompatible between these types.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: number\\"'.

    304   expectTypeOf<typeof A>().toEqualTypeOf<typeof B>()
                                                 ~~~~~~~~
    "
  `)
})
