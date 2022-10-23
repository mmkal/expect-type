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
    test/usage.test.ts:34:23 - error TS2554: Expected 2 arguments, but got 1.

    34   expectTypeOf<any>().toEqualTypeOf({a: 1, b: 1})
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:143:7
        143       ...MISMATCH: Or<[IsNeverOrAny<Actual>, IsNeverOrAny<Expected>]> extends true
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        144         ? MismatchArgs<Equal<Actual, Expected>, B>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        145         : []
            ~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:36:39 - error TS2345: Argument of type '{ a: number; b: number; }' is not assignable to parameter of type '\\"err\\"'.

    36   expectTypeOf<never>().toEqualTypeOf({a: 1, b: 1})
                                             ~~~~~~~~~~~~
    test/usage.test.ts:38:25 - error TS2554: Expected 1 arguments, but got 0.

    38   expectTypeOf<never>().toEqualTypeOf<any>()
                               ~~~~~~~~~~~~~~~~~~~~

      src/index.ts:137:7
        137       ...MISMATCH: Or<[IsNeverOrAny<Actual>, IsNeverOrAny<Expected>]> extends true
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        138         ? MismatchArgs<Equal<Actual, Expected>, B>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        139         : []
            ~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:40:31 - error TS2554: Expected 1 arguments, but got 0.

    40   expectTypeOf<{a: number}>().toEqualTypeOf<any>()
                                     ~~~~~~~~~~~~~~~~~~~~

      src/index.ts:137:7
        137       ...MISMATCH: Or<[IsNeverOrAny<Actual>, IsNeverOrAny<Expected>]> extends true
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        138         ? MismatchArgs<Equal<Actual, Expected>, B>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        139         : []
            ~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:42:31 - error TS2554: Expected 1 arguments, but got 0.

    42   expectTypeOf<{a: number}>().toEqualTypeOf<never>()
                                     ~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:137:7
        137       ...MISMATCH: Or<[IsNeverOrAny<Actual>, IsNeverOrAny<Expected>]> extends true
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        138         ? MismatchArgs<Equal<Actual, Expected>, B>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        139         : []
            ~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:44:45 - error TS2344: Type 'unknown' does not satisfy the constraint 'Mismatch<{ a: number; }>'.
      Property 'a' is missing in type '{}' but required in type '{ a: number; }'.

    44   expectTypeOf<{a: number}>().toEqualTypeOf<unknown>()
                                                   ~~~~~~~

      test/usage.test.ts:44:17
        44   expectTypeOf<{a: number}>().toEqualTypeOf<unknown>()
                           ~
        'a' is declared here.
    test/usage.test.ts:54:39 - error TS2344: Type 'Apple' does not satisfy the constraint 'Mismatch<Fruit>'.
      Property '[secret]' is missing in type 'Apple' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    54   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:57:39 - error TS2344: Type 'Fruit' does not satisfy the constraint 'Mismatch<Apple>'.
      Property 'name' is missing in type 'Fruit' but required in type 'Apple'.

    57   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:49:32
        49   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:61:39 - error TS2345: Argument of type '{ b: number; }' is not assignable to parameter of type 'Mismatch<{ a: number; }>'.
      Object literal may only specify known properties, and 'b' does not exist in type 'Mismatch<{ a: number; }>'.

    61   expectTypeOf({a: 1}).toMatchTypeOf({b: 1})
                                             ~~~~
    test/usage.test.ts:70:39 - error TS2344: Type 'Apple' does not satisfy the constraint 'Mismatch<Fruit>'.
      Property '[secret]' is missing in type 'Apple' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    70   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:71:39 - error TS2344: Type 'Fruit' does not satisfy the constraint 'Mismatch<Apple>'.
      Property 'name' is missing in type 'Fruit' but required in type 'Apple'.

    71   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~

      test/usage.test.ts:66:32
        66   type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}
                                          ~~~~
        'name' is declared here.
    test/usage.test.ts:80:25 - error TS2554: Expected 1 arguments, but got 0.

    80   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~~~

      src/index.ts:114:16
        114   toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:84:57 - error TS2344: Type '{ deeply: { nested: unknown; }; }' does not satisfy the constraint 'Mismatch<{ deeply: { nested: any; }; }>'.
      Property '[secret]' is missing in type '{ deeply: { nested: unknown; }; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    84   expectTypeOf<{deeply: {nested: any}}>().toEqualTypeOf<{deeply: {nested: unknown}}>()
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:102:27 - error TS2554: Expected 1 arguments, but got 0.

    102   expectTypeOf(undefined).toBeNullable()
                                  ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:106:22 - error TS2554: Expected 1 arguments, but got 0.

    106   expectTypeOf(null).toBeNullable()
                             ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:109:33 - error TS2554: Expected 1 arguments, but got 0.

    109   expectTypeOf<1 | undefined>().toBeNullable()
                                        ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:110:28 - error TS2554: Expected 1 arguments, but got 0.

    110   expectTypeOf<1 | null>().toBeNullable()
                                   ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:111:40 - error TS2554: Expected 1 arguments, but got 0.

    111   expectTypeOf<1 | undefined | null>().toBeNullable()
                                               ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:115:19 - error TS2554: Expected 1 arguments, but got 0.

    115   expectTypeOf(1).toBeUnknown()
                          ~~~~~~~~~~~~~

      src/index.ts:109:17
        109   toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:116:19 - error TS2554: Expected 1 arguments, but got 0.

    116   expectTypeOf(1).toBeAny()
                          ~~~~~~~~~

      src/index.ts:108:13
        108   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:117:19 - error TS2554: Expected 1 arguments, but got 0.

    117   expectTypeOf(1).toBeNever()
                          ~~~~~~~~~~~

      src/index.ts:110:15
        110   toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:118:19 - error TS2554: Expected 1 arguments, but got 0.

    118   expectTypeOf(1).toBeNull()
                          ~~~~~~~~~~

      src/index.ts:119:14
        119   toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:119:19 - error TS2554: Expected 1 arguments, but got 0.

    119   expectTypeOf(1).toBeUndefined()
                          ~~~~~~~~~~~~~~~

      src/index.ts:120:19
        120   toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:120:19 - error TS2554: Expected 1 arguments, but got 0.

    120   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~~~

      src/index.ts:121:18
        121   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:125:49 - error TS2344: Type 'number' does not satisfy the constraint 'Mismatch<string | number>'.

    125   expectTypeOf<string | number>().toMatchTypeOf<number>()
                                                        ~~~~~~
    test/usage.test.ts:149:71 - error TS2554: Expected 2 arguments, but got 1.

    149   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:152:5
        152     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:166:21 - error TS2554: Expected 2 arguments, but got 1.

    166   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:152:5
        152     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:171:41 - error TS2554: Expected 1 arguments, but got 0.

    171   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~~~

      src/index.ts:115:16
        115   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:178:41 - error TS2344: Type 'HasParam' does not satisfy the constraint 'Mismatch<NoParam>'.
      Type 'HasParam' is not assignable to type 'NoParam'.

    178   expectTypeOf<NoParam>().toEqualTypeOf<HasParam>()
                                                ~~~~~~~~
    test/usage.test.ts:198:19 - error TS2554: Expected 1 arguments, but got 0.

    198   expectTypeOf(f).toBeAny()
                          ~~~~~~~~~

      src/index.ts:108:13
        108   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:199:27 - error TS2554: Expected 1 arguments, but got 0.

    199   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~~~

      src/index.ts:108:13
        108   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:202:46 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'Mismatch<number>'.
      Type 'string' is not assignable to type 'number'.

    202   expectTypeOf(f).parameter(0).toEqualTypeOf('1')
                                                     ~~~
    test/usage.test.ts:254:43 - error TS2345: Argument of type '(this: { name: string; }, message: string) => string' is not assignable to parameter of type 'Mismatch<(this: { title: string; name: string; }, message: string) => string>'.
      Type '(this: { name: string; }, message: string) => string' is not assignable to type '{ [secret]: \\"Type should be satisified\\"; }'.

    254   expectTypeOf(greetFormal).toEqualTypeOf(greetCasual)
                                                  ~~~~~~~~~~~
    test/usage.test.ts:269:33 - error TS2554: Expected 1 arguments, but got 0.

    269   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~~~

      src/index.ts:115:16
        115   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:281:45 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a: string; }>'.
      Type '{ a: number; }' is not assignable to type '{ a: string; }'.
        Types of property 'a' are incompatible.
          Type 'number' is not assignable to type 'string'.

    281   expectTypeOf<{a: string}>().toEqualTypeOf<{a: number}>()
                                                    ~~~~~~~~~~~
    test/usage.test.ts:286:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    286   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number}>()
                                                     ~~~~~~~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:287:46 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    287   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number | undefined}>()
                                                     ~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:288:53 - error TS2344: Type '{ a: number; }' does not satisfy the constraint 'Mismatch<{ a?: number; }>'.
      Type '{ a: number; }' is not assignable to type '{ a?: number; } & { [secret]: \\"Type should be satisified\\"; }'.
        Property '[secret]' is missing in type '{ a: number; }' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    288   expectTypeOf<{a?: number | null}>().toEqualTypeOf<{a: number | null}>()
                                                            ~~~~~~~~~~~~~~~~~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:297:36 - error TS2344: Type 'E1' does not satisfy the constraint 'Mismatch<A1>'.
      Property '[secret]' is missing in type 'E1' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    297   expectTypeOf<A1>().toEqualTypeOf<E1>()
                                           ~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:303:36 - error TS2344: Type 'E2' does not satisfy the constraint 'Mismatch<A2>'.
      Property '[secret]' is missing in type 'E2' but required in type '{ [secret]: \\"Type should be satisified\\"; }'.

    303   expectTypeOf<A2>().toEqualTypeOf<E2>()
                                           ~~

      src/index.ts:105:45
        105 type Mismatch<T> = (BrandSpecial<T> | T) & {[secret]: 'Type should be satisified'}
                                                        ~~~~~~~~
        '[secret]' is declared here.
    test/usage.test.ts:320:42 - error TS2344: Type 'typeof B' does not satisfy the constraint 'Mismatch<typeof A>'.
      Type 'typeof B' is not assignable to type 'typeof A'.
        Types of construct signatures are incompatible.
          Type 'new (b: 2) => B' is not assignable to type 'new (a: 1) => A'.
            Types of parameters 'b' and 'a' are incompatible.
              Type '1' is not assignable to type '2'.

    320   expectTypeOf<typeof A>().toEqualTypeOf<typeof B>()
                                                 ~~~~~~~~
    "
  `)
})
