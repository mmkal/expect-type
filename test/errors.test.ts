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
    "test/test.ts:3:22 - error TS2554: Expected 1 arguments, but got 0.

    3 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:3:36 - error TS2345: Argument of type '{ a: string; }' is not assignable to parameter of type 'never'.

    3 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                         ~~~~~~~~~~
    "
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:3:22 - error TS2554: Expected 1 arguments, but got 0.

    3 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:126:16
        126     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})

test('toMatchTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:3:22 - error TS2554: Expected 2 arguments, but got 1.

    3 expectTypeOf({a: 1}).toMatchTypeOf({a: 'one'})
                           ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:127:36
        127     <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
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
    "test/usage.test.ts:21:30 - error TS2554: Expected 1 arguments, but got 0.

    21   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:35:25 - error TS2554: Expected 1 arguments, but got 0.

    35   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                               ~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:126:16
        126     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:38:25 - error TS2554: Expected 1 arguments, but got 0.

    38   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                               ~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:42:24 - error TS2554: Expected 2 arguments, but got 1.

    42   expectTypeOf({a: 1}).toMatchTypeOf({b: 1})
                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:127:36
        127     <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:51:25 - error TS2554: Expected 1 arguments, but got 0.

    51   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                               ~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:126:16
        126     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:52:25 - error TS2554: Expected 1 arguments, but got 0.

    52   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                               ~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:61:25 - error TS2554: Expected 1 arguments, but got 0.

    61   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~~~

      src/index.ts:117:16
        117   toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, Options['positive']>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:65:43 - error TS2554: Expected 1 arguments, but got 0.

    65   expectTypeOf<{deeply: {nested: any}}>().toEqualTypeOf<{deeply: {nested: unknown}}>()
                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:83:27 - error TS2554: Expected 1 arguments, but got 0.

    83   expectTypeOf(undefined).toBeNullable()
                                 ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:87:22 - error TS2554: Expected 1 arguments, but got 0.

    87   expectTypeOf(null).toBeNullable()
                            ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:90:33 - error TS2554: Expected 1 arguments, but got 0.

    90   expectTypeOf<1 | undefined>().toBeNullable()
                                       ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:91:28 - error TS2554: Expected 1 arguments, but got 0.

    91   expectTypeOf<1 | null>().toBeNullable()
                                  ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:92:40 - error TS2554: Expected 1 arguments, but got 0.

    92   expectTypeOf<1 | undefined | null>().toBeNullable()
                                              ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:96:19 - error TS2554: Expected 1 arguments, but got 0.

    96   expectTypeOf(1).toBeUnknown()
                         ~~~~~~~~~~~~~

      src/index.ts:112:17
        112   toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, Options['positive']>) => true
                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:97:19 - error TS2554: Expected 1 arguments, but got 0.

    97   expectTypeOf(1).toBeAny()
                         ~~~~~~~~~

      src/index.ts:111:13
        111   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, Options['positive']>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:98:19 - error TS2554: Expected 1 arguments, but got 0.

    98   expectTypeOf(1).toBeNever()
                         ~~~~~~~~~~~

      src/index.ts:113:15
        113   toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, Options['positive']>) => true
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:99:19 - error TS2554: Expected 1 arguments, but got 0.

    99   expectTypeOf(1).toBeNull()
                         ~~~~~~~~~~

      src/index.ts:122:14
        122   toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, Options['positive']>) => true
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:100:19 - error TS2554: Expected 1 arguments, but got 0.

    100   expectTypeOf(1).toBeUndefined()
                          ~~~~~~~~~~~~~~~

      src/index.ts:123:19
        123   toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, Options['positive']>) => true
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:101:19 - error TS2554: Expected 1 arguments, but got 0.

    101   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~~~

      src/index.ts:124:18
        124   toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>, Options['branded']>>, Options['positive']>) => true
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:106:35 - error TS2554: Expected 1 arguments, but got 0.

    106   expectTypeOf<string | number>().toMatchTypeOf<number>()
                                          ~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:126:16
        126     <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:130:71 - error TS2554: Expected 2 arguments, but got 1.

    130   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:137:5
        137     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, Options['positive']>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:147:21 - error TS2554: Expected 2 arguments, but got 1.

    147   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:137:5
        137     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, Options['positive']>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:152:41 - error TS2554: Expected 1 arguments, but got 0.

    152   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~~~

      src/index.ts:118:16
        118   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, Options['positive']>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:159:27 - error TS2554: Expected 1 arguments, but got 0.

    159   expectTypeOf<NoParam>().toEqualTypeOf<HasParam>()
                                  ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:179:19 - error TS2554: Expected 1 arguments, but got 0.

    179   expectTypeOf(f).toBeAny()
                          ~~~~~~~~~

      src/index.ts:111:13
        111   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, Options['positive']>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:180:27 - error TS2554: Expected 1 arguments, but got 0.

    180   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~~~

      src/index.ts:111:13
        111   toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, Options['positive']>) => true
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:183:46 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.

    183   expectTypeOf(f).parameter(0).toEqualTypeOf('1')
                                                     ~~~
    test/usage.test.ts:231:43 - error TS2345: Argument of type '(this: { name: string; }, message: string) => string' is not assignable to parameter of type 'never'.

    231   expectTypeOf(greetFormal).toEqualTypeOf(greetCasual)
                                                  ~~~~~~~~~~~
    test/usage.test.ts:246:33 - error TS2554: Expected 1 arguments, but got 0.

    246   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~~~

      src/index.ts:118:16
        118   toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, Options['positive']>) => true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:258:31 - error TS2554: Expected 1 arguments, but got 0.

    258   expectTypeOf<{a: string}>().toEqualTypeOf<{a: number}>()
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:262:32 - error TS2554: Expected 1 arguments, but got 0.

    262   expectTypeOf<{a?: number}>().toEqualTypeOf<{}>()
                                       ~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:263:32 - error TS2554: Expected 1 arguments, but got 0.

    263   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number}>()
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:264:32 - error TS2554: Expected 1 arguments, but got 0.

    264   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number | undefined}>()
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:265:39 - error TS2554: Expected 1 arguments, but got 0.

    265   expectTypeOf<{a?: number | null}>().toEqualTypeOf<{a: number | null}>()
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:266:37 - error TS2554: Expected 1 arguments, but got 0.

    266   expectTypeOf<{a: {b?: number}}>().toEqualTypeOf<{a: {}}>()
                                            ~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:274:22 - error TS2554: Expected 1 arguments, but got 0.

    274   expectTypeOf<A1>().toEqualTypeOf<E1>()
                             ~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:280:22 - error TS2554: Expected 1 arguments, but got 0.

    280   expectTypeOf<A2>().toEqualTypeOf<E2>()
                             ~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:297:28 - error TS2554: Expected 1 arguments, but got 0.

    297   expectTypeOf<typeof A>().toEqualTypeOf<typeof B>()
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:130:16
        130     <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected, Options['branded']>, Options['positive']>): true
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})
