import * as fs from 'fs'
import stripAnsi from 'strip-ansi'
import * as tsmorph from 'ts-morph'

const tsErrors = (code: string) => {
  const project = new tsmorph.Project()
  project.addSourceFileAtPath('./src/index.ts')
  project.createSourceFile('./test/test.ts', `import {expectTypeOf} from '../src'\n\n${code}`)
  const diagnostics = project.getPreEmitDiagnostics()
  const formatted = project.formatDiagnosticsWithColorAndContext(diagnostics)
  return stripAnsi(formatted)
}

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:3:36 - error TS2344: Type '{ a: string; }' does not satisfy the constraint 'Mismatch<{ a: number; }>'.
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
    "test/test.ts:3:37 - error TS2322: Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                          ~

      test/test.ts:3:15
        3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type 'Mismatch<{ a: number; }>'
    "
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:3:36 - error TS2344: Type '{ a: string; }' does not satisfy the constraint 'Mismatch<{ a: number; }>'.
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
    "test/test.ts:3:37 - error TS2322: Type 'string' is not assignable to type 'number'.

    3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                                          ~

      test/test.ts:3:15
        3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                        ~~~~
        The expected type comes from property 'a' which is declared here on type 'Mismatch<{ a: number; }>'
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
    "test/usage.test.ts:21:44 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a: number; b: number; }>'.
      Property 'b' is missing in type '{ a: number; }' but required in type '{ a: number; b: number; }'.

    21   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                                  ~~~~~~~~~~~

      test/usage.test.ts:21:23
        21   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                 ~~~~
        'b' is declared here.
    test/usage.test.ts:30:45 - error TS2345: Argument of type '{ a: number; b: number; }' is not assignable to parameter of type 'Mismatch<{ a: number; }>'.
      Object literal may only specify known properties, and 'b' does not exist in type 'Mismatch<{ a: number; }>'.

    30   expectTypeOf({a: 1}).toEqualTypeOf({a: 1, b: 1})
                                                   ~~~~
    test/usage.test.ts:32:45 - error TS2345: Argument of type '{ a: number; b: number; }' is not assignable to parameter of type 'Mismatch<{ a: number; }>'.
      Object literal may only specify known properties, and 'b' does not exist in type 'Mismatch<{ a: number; }>'.

    32   expectTypeOf({a: 1}).toMatchTypeOf({a: 1, b: 1})
                                                   ~~~~
    test/usage.test.ts:42:39 - error TS2344: Type 'Apple' does not satisfy the constraint 'Mismatch<Fruit>'.
      Property '[secret]' is missing in type 'Apple' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    42   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:45:39 - error TS2344: Type 'Fruit' does not satisfy the constraint 'Mismatch<Apple>'.
      Property 'name' is missing in type 'Fruit' but required in type 'Apple'.

    45   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:37:32
        37   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:49:39 - error TS2345: Argument of type '{ b: number; }' is not assignable to parameter of type 'Mismatch<{ a: number; }>'.
      Object literal may only specify known properties, and 'b' does not exist in type 'Mismatch<{ a: number; }>'.

    49   expectTypeOf({a: 1}).toMatchTypeOf({b: 1})
                                             ~~~~
    test/usage.test.ts:58:39 - error TS2344: Type 'Apple' does not satisfy the constraint 'Mismatch<Fruit>'.
      Property '[secret]' is missing in type 'Apple' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    58   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:59:39 - error TS2344: Type 'Fruit' does not satisfy the constraint 'Mismatch<Apple>'.
      Property 'name' is missing in type 'Fruit' but required in type 'Apple'.

    59   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:54:32
        54   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:68:25 - error TS2554: Expected 1 arguments, but got 0.

    68   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~~~

      src/index.ts:113:16
        113   toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:72:57 - error TS2344: Type '{ deeply: { nested: unknown; }; }' does not satisfy the constraint 'Mismatch<{ deeply: { nested: any; }; }>'.
      Property '[secret]' is missing in type '{ deeply: { nested: unknown; }; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    72   expectTypeOf<{deeply: {nested: any}}>().toEqualTypeOf<{deeply: {nested: unknown}}>()
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:90:27 - error TS2554: Expected 1 arguments, but got 0.

    90   expectTypeOf(undefined).toBeNullable()
                                 ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:94:22 - error TS2554: Expected 1 arguments, but got 0.

    94   expectTypeOf(null).toBeNullable()
                            ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:97:33 - error TS2554: Expected 1 arguments, but got 0.

    97   expectTypeOf<1 | undefined>().toBeNullable()
                                       ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:98:28 - error TS2554: Expected 1 arguments, but got 0.

    98   expectTypeOf<1 | null>().toBeNullable()
                                  ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:40 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf<1 | undefined | null>().toBeNullable()
                                              ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:103:19 - error TS2554: Expected 1 arguments, but got 0.

    103   expectTypeOf(1).toBeUnknown()
                          ~~~~~~~~~~~~~

      src/index.ts:108:17
        108   toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:104:19 - error TS2554: Expected 1 arguments, but got 0.

    104   expectTypeOf(1).toBeAny()
                          ~~~~~~~~~

      src/index.ts:107:13
        107   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:105:19 - error TS2554: Expected 1 arguments, but got 0.

    105   expectTypeOf(1).toBeNever()
                          ~~~~~~~~~~~

      src/index.ts:109:15
        109   toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:106:19 - error TS2554: Expected 1 arguments, but got 0.

    106   expectTypeOf(1).toBeNull()
                          ~~~~~~~~~~

      src/index.ts:118:14
        118   toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:107:19 - error TS2554: Expected 1 arguments, but got 0.

    107   expectTypeOf(1).toBeUndefined()
                          ~~~~~~~~~~~~~~~

      src/index.ts:119:19
        119   toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:108:19 - error TS2554: Expected 1 arguments, but got 0.

    108   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~~~

      src/index.ts:120:18
        120   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:113:49 - error TS2344: Type 'number' does not satisfy the constraint 'Mismatch<string | number>'.

    113   expectTypeOf<string | number>().toMatchTypeOf<number>()
                                                        ~~~~~~
    test/usage.test.ts:137:71 - error TS2554: Expected 2 arguments, but got 1.

    137   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:151:5
        151     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:154:21 - error TS2554: Expected 2 arguments, but got 1.

    154   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:151:5
        151     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:159:41 - error TS2554: Expected 1 arguments, but got 0.

    159   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~~~

      src/index.ts:114:16
        114   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:166:41 - error TS2344: Type 'HasParam' does not satisfy the constraint 'Mismatch<NoParam>'.
      Type 'HasParam' is not assignable to type 'NoParam'.

    166   expectTypeOf<NoParam>().toEqualTypeOf<HasParam>()
                                                ~~~~~~~~
    test/usage.test.ts:186:19 - error TS2554: Expected 1 arguments, but got 0.

    186   expectTypeOf(f).toBeAny()
                          ~~~~~~~~~

      src/index.ts:107:13
        107   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:187:27 - error TS2554: Expected 1 arguments, but got 0.

    187   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~~~

      src/index.ts:107:13
        107   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:190:46 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'Mismatch<number>'.
      Type 'string' is not assignable to type 'number'.

    190   expectTypeOf(f).parameter(0).toEqualTypeOf('1')
                                                     ~~~
    test/usage.test.ts:238:43 - error TS2345: Argument of type '(this: { name: string; }, message: string) => string' is not assignable to parameter of type 'Mismatch<(this: { title: string; name: string; }, message: string) => string>'.
      Type '(this: { name: string; }, message: string) => string' is not assignable to type '{ [secret]: \\"Type should be satisified\\"; }'.

    238   expectTypeOf(greetFormal).toEqualTypeOf(greetCasual)
                                                  ~~~~~~~~~~~
    test/usage.test.ts:253:33 - error TS2554: Expected 1 arguments, but got 0.

    253   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~~~

      src/index.ts:114:16
        114   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:265:45 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a: string; }>'.
      Type '{ a: number; }' is not assignable to type '{ a: string; }'.
        Types of property 'a' are incompatible.
          Type 'number' is not assignable to type 'string'.

    265   expectTypeOf<{a: string}>().toEqualTypeOf<{a: number}>()
                                                    ~~~~~~~~~~~
    test/usage.test.ts:270:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    270   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number}>()
                                                     ~~~~~~~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:271:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    271   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number | undefined}>()
                                                     ~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:272:53 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    272   expectTypeOf<{a?: number | null}>().toEqualTypeOf<{a: number | null}>()
                                                            ~~~~~~~~~~~~~~~~~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:281:36 - error TS2344: Type 'E1' does not satisfy the constraint 'Mismatch<A1>'.
      Property '[secret]' is missing in type 'E1' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    281   expectTypeOf<A1>().toEqualTypeOf<E1>()
                                           ~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:287:36 - error TS2344: Type 'E2' does not satisfy the constraint 'Mismatch<A2>'.
      Property '[secret]' is missing in type 'E2' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    287   expectTypeOf<A2>().toEqualTypeOf<E2>()
                                           ~~

      src/index.ts:104:45
        104 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:304:42 - error TS2344: Type 'typeof B' does not satisfy the constraint 'Mismatch<typeof A>'.
      Type 'typeof B' is not assignable to type 'typeof A'.
        Types of construct signatures are incompatible.
          Type 'new (b: 2) => B' is not assignable to type 'new (a: 1) => A'.
            Types of parameters 'b' and 'a' are incompatible.
              Type '1' is not assignable to type '2'.

    304   expectTypeOf<typeof A>().toEqualTypeOf<typeof B>()
                                                 ~~~~~~~~
    "
  `)
})
