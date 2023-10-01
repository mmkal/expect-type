import * as fs from 'fs'
import {tsErrors, tsFileErrors} from './ts-output'

test('toEqualTypeOf error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    9 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
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
    "test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type 'never'.

    9 expectTypeOf<{a: any}>().toEqualTypeOf<{a: 1}>()
                                             ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: never\\"'.

    9 expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()
                                               ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: unknown\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: unknown\\"'.

    9 expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()
                                                 ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: any; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'any' is not assignable to type 'never'.

    9 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: any}>()
                                           ~~~~~~~~
    test/test.ts:9:99 - error TS2554: Expected 1 arguments, but got 0.

    9 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: never}>()
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/test.ts:9:99 - error TS2344: Type '{ a: unknown; }' does not satisfy the constraint '{ a: \\"Expected: unknown, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'unknown' is not assignable to type '\\"Expected: unknown, Actual: never\\"'.

    9 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: unknown}>()
                                           ~~~~~~~~~~~~
    "
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
    "test/test.ts:9:99 - error TS2344: Type '{ a: \\"abc\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: abc, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"abc\\"' is not assignable to type '\\"Expected: literal string: abc, Actual: string\\"'.

    9 expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'abc'}>()
                                                ~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: never\\"'.

    9 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: string}>()
                                               ~~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: \\"xyz\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: xyz, Actual: literal string: abc\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"xyz\\"' is not assignable to type '\\"Expected: literal string: xyz, Actual: literal string: abc\\"'.

    9 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: 'xyz'}>()
                                               ~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: number\\"'.

    9 expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()
                                                ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    9 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: number}>()
                                           ~~~~~~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: 2; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 2, Actual: literal number: 1\\"; }'.
      Types of property 'a' are incompatible.
        Type '2' is not assignable to type '\\"Expected: literal number: 2, Actual: literal number: 1\\"'.

    9 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: 2}>()
                                           ~~~~~~
    test/test.ts:9:99 - error TS2344: Type '{ a: true; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: true, Actual: literal boolean: false\\"; }'.
      Types of property 'a' are incompatible.
        Type 'true' is not assignable to type '\\"Expected: literal boolean: true, Actual: literal boolean: false\\"'.

    9 expectTypeOf<{a: boolean}>().toEqualTypeOf<{a: true}>()
                                                 ~~~~~~~~~
    test/test.ts:99:99 - error TS2344: Type '{ a: boolean; }' does not satisfy the constraint '{ a: \\"Expected: boolean, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'boolean' is not assignable to type '\\"Expected: boolean, Actual: never\\"'.

    99 expectTypeOf<{a: true}>().toEqualTypeOf<{a: boolean}>()
                                               ~~~~~~~~~~~~
    test/test.ts:99:99 - error TS2344: Type '{ a: false; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Types of property 'a' are incompatible.
        Type 'false' is not assignable to type '\\"Expected: literal boolean: false, Actual: literal boolean: true\\"'.

    99 expectTypeOf<{a: true}>().toEqualTypeOf<{a: false}>()
                                               ~~~~~~~~~~
    "
  `)
})

test('.toMatchTypeOf error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    9 expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()
                                         ~~~~~~~~~~~
    "
  `)
})

test('toBeNullable', async () => {
  const okAssertion = `expectTypeOf<1 | undefined>().toBeNullable()`
  expect(tsErrors(okAssertion + '\n' + okAssertion.replace('.toBe', '.not.toBe'))).toMatchInlineSnapshot(`
    "test/test.ts:9:99 - error TS2349: This expression is not callable.
      Type 'Inverted<ExpectNullable<1 | undefined>>' has no call signatures.

    9 expectTypeOf<1 | undefined>().not.toBeNullable()
                                        ~~~~~~~~~~~~
    "
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

  expect(tsFileErrors({filepath: 'test/usage.test.ts', content: usageTestFile})).toMatchInlineSnapshot(`
    "test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: never, Actual: number\\"; }'.
      Property 'b' is missing in type '{ a: number; }' but required in type '{ a: number; b: \\"Expected: never, Actual: number\\"; }'.

    99   expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
                                                  ~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; b: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'b' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    99   expectTypeOf({a: 1}).toEqualTypeOf<{a: number; b: number}>()
                                            ~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ a: number; b: number; }' does not satisfy the constraint '{ a: number; b: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'b' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    99   expectTypeOf({a: 1}).toMatchTypeOf<{a: number; b: number}>()
                                            ~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Apple' does not satisfy the constraint '{ name: \\"Expected: literal string: Apple, Actual: never\\"; type: \\"Fruit\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\"; }'.
      Types of property 'name' are incompatible.
        Type '\\"Apple\\"' is not assignable to type '\\"Expected: literal string: Apple, Actual: never\\"'.

    99   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ name: \\"Expected: never, Actual: literal string: Apple\\"; type: \\"Fruit\\"; edible: \\"Expected: boolean, Actual: never\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ name: \\"Expected: never, Actual: literal string: Apple\\"; type: \\"Fruit\\"; edible: \\"Expected: boolean, Actual: never\\"; }'.

    99   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ b: number; }' does not satisfy the constraint '{ a: \\"Expected: never, Actual: number\\"; b: \\"Expected: number, Actual: never\\"; }'.
      Property 'a' is missing in type '{ b: number; }' but required in type '{ a: \\"Expected: never, Actual: number\\"; b: \\"Expected: number, Actual: never\\"; }'.

    99   expectTypeOf({a: 1}).toMatchTypeOf<{b: number}>()
                                            ~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Apple' does not satisfy the constraint '{ name: \\"Expected: literal string: Apple, Actual: never\\"; type: \\"Fruit\\"; edible: \\"Expected: literal boolean: true, Actual: literal boolean: false\\"; }'.
      Types of property 'name' are incompatible.
        Type '\\"Apple\\"' is not assignable to type '\\"Expected: literal string: Apple, Actual: never\\"'.

    99   expectTypeOf<Fruit>().toMatchTypeOf<Apple>()
                                             ~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type 'Fruit' does not satisfy the constraint '{ name: \\"Expected: never, Actual: literal string: Apple\\"; type: \\"Fruit\\"; edible: \\"Expected: boolean, Actual: never\\"; }'.
      Property 'name' is missing in type 'Fruit' but required in type '{ name: \\"Expected: never, Actual: literal string: Apple\\"; type: \\"Fruit\\"; edible: \\"Expected: boolean, Actual: never\\"; }'.

    99   expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
                                             ~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectNumber<never>' has no call signatures.

    99   expectTypeOf<never>().toBeNumber()
                               ~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2344: Type '{ deeply: { nested: unknown; }; }' does not satisfy the constraint '{ deeply: { nested: \\"Expected: unknown, Actual: never\\"; }; }'.
      The types of 'deeply.nested' are incompatible between these types.
        Type 'unknown' is not assignable to type '\\"Expected: unknown, Actual: never\\"'.

    99   expectTypeOf<{deeply: {nested: any}}>().toEqualTypeOf<{deeply: {nested: unknown}}>()
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectNull<undefined>' has no call signatures.

    99   expectTypeOf(undefined).toBeNull()
                                 ~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectUndefined<null>' has no call signatures.

    99   expectTypeOf(null).toBeUndefined()
                            ~~~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectUnknown<number>' has no call signatures.

    99   expectTypeOf(1).toBeUnknown()
                         ~~~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectAny<number>' has no call signatures.

    99   expectTypeOf(1).toBeAny()
                         ~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectNever<number>' has no call signatures.

    99   expectTypeOf(1).toBeNever()
                         ~~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectNull<number>' has no call signatures.

    99   expectTypeOf(1).toBeNull()
                         ~~~~~~~~
    test/usage.test.ts:99:99 - error TS2349: This expression is not callable.
      Type 'ExpectUndefined<number>' has no call signatures.

    99   expectTypeOf(1).toBeUndefined()
                         ~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2349: This expression is not callable.
      Type 'ExpectNullable<number>' has no call signatures.

    999   expectTypeOf(1).toBeNullable()
                          ~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type 'number' does not satisfy the constraint '\\"Expected: number, Actual: string\\"'.

    999   expectTypeOf<string | number>().toMatchTypeOf<number>()
                                                        ~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 2 arguments, but got 1.

    999   expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('xxl')
                                                                              ~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, Options['positive']>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 2 arguments, but got 1.

    999   expectTypeOf(obj).toHaveProperty('c')
                            ~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999     ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, Options['positive']>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2349: This expression is not callable.
      Type 'ExpectString<number>' has no call signatures.

    999   expectTypeOf(obj).toHaveProperty('a').toBeString()
                                                ~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type 'HasParam' does not satisfy the constraint '\\"Expected: function, Actual: never\\"'.

    999   expectTypeOf<NoParam>().toEqualTypeOf<HasParam>()
                                                ~~~~~~~~
    test/usage.test.ts:999:99 - error TS2349: This expression is not callable.
      Type 'ExpectAny<(a: number) => number[]>' has no call signatures.

    999   expectTypeOf(f).toBeAny()
                          ~~~~~~~
    test/usage.test.ts:999:99 - error TS2349: This expression is not callable.
      Type 'ExpectAny<number[]>' has no call signatures.

    999   expectTypeOf(f).returns.toBeAny()
                                  ~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type 'string' does not satisfy the constraint '\\"Expected: string, Actual: number\\"'.

    999   expectTypeOf(f).parameter(0).toEqualTypeOf<string>()
                                                     ~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '(this: { name: string; }, message: string) => string' does not satisfy the constraint '\\"Expected: function, Actual: function\\"'.

    999   expectTypeOf(greetFormal).toEqualTypeOf<typeof greetCasual>()
                                                  ~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2349: This expression is not callable.
      Type 'ExpectString<number>' has no call signatures.

    999   expectTypeOf([1, 2, 3]).items.toBeString()
                                        ~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type 'number[]' does not satisfy the constraint '{ [x: number]: never; [iterator]: \\"Expected: function, Actual: never\\"; [unscopables]: () => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }; length: number; toString: () => string; concat: { (...items: ConcatArray<any>[]): any[]; (...items: any[]): any[]; }; indexOf: (searchElement: any, fromIndex?: number | undefined) => number; lastIndexOf: (searchElement: any, fromIndex?: number | undefined) => number; slice: (start?: number | undefined, end?: number | undefined) => any[]; includes: (searchElement: any, fromIndex?: number | undefined) => boolean; toLocaleString: () => string; join: (separator?: string | undefined) => string; every: { <S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean; }; some: (predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any) => boolean; forEach: (callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any) => void; map: <U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any) => U[]; filter: { <S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): S[]; (predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): any[]; }; reduce: { (callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any; (callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any; <U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U; }; reduceRight: { (callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any; (callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any; <U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U; }; find: \\"Expected: function, Actual: never\\"; findIndex: (predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any) => number; entries: () => IterableIterator<[number, any]>; keys: () => IterableIterator<number>; values: \\"Expected: function, Actual: never\\"; pop: \\"Expected: function, Actual: never\\"; push: (...items: any[]) => number; reverse: () => any[]; shift: \\"Expected: function, Actual: never\\"; sort: (compareFn?: ((a: any, b: any) => number) | undefined) => any[]; splice: { (start: number, deleteCount?: number | undefined): any[]; (start: number, deleteCount: number, ...items: any[]): any[]; }; unshift: (...items: any[]) => number; fill: (value: any, start?: number | undefined, end?: number | undefined) => any[]; copyWithin: (target: number, start: number, end?: number | undefined) => any[]; }'.
      Types of property '[iterator]' are incompatible.
        Type '() => IterableIterator<number>' is not assignable to type '\\"Expected: function, Actual: never\\"'.

    999   expectTypeOf<any[]>().toEqualTypeOf<number[]>()
                                              ~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: string\\"'.

    999   expectTypeOf<{a: string}>().toEqualTypeOf<{a: number}>()
                                                    ~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{}' does not satisfy the constraint '{ a: \\"Expected: never, Actual: number\\" | \\"Expected: never, Actual: undefined\\"; }'.
      Property 'a' is missing in type '{}' but required in type '{ a: \\"Expected: never, Actual: number\\" | \\"Expected: never, Actual: undefined\\"; }'.

    999   expectTypeOf<{a?: number}>().toEqualTypeOf<{}>()
                                                     ~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: undefined\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: undefined\\"'.

    999   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number}>()
                                                     ~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<{a?: number}>().toEqualTypeOf<{a: number | undefined}>()
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: number | null; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: undefined\\" | \\"Expected: null, Actual: undefined\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number | null' is not assignable to type '\\"Expected: number, Actual: undefined\\" | \\"Expected: null, Actual: undefined\\"'.
          Type 'null' is not assignable to type '\\"Expected: number, Actual: undefined\\" | \\"Expected: null, Actual: undefined\\"'.

    999   expectTypeOf<{a?: number | null}>().toEqualTypeOf<{a: number | null}>()
                                                            ~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2344: Type '{ a: {}; }' does not satisfy the constraint '{ a: { b: \\"Expected: never, Actual: number\\" | \\"Expected: never, Actual: undefined\\"; }; }'.
      Types of property 'a' are incompatible.
        Property 'b' is missing in type '{}' but required in type '{ b: \\"Expected: never, Actual: number\\" | \\"Expected: never, Actual: undefined\\"; }'.

    999   expectTypeOf<{a: {b?: number}}>().toEqualTypeOf<{a: {}}>()
                                                          ~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<A1>().toEqualTypeOf<E1>()
                             ~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<A2>().toEqualTypeOf<E2>()
                             ~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<typeof A>().toEqualTypeOf<typeof B>()
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<{a: 1} & {b: 2}>().toEqualTypeOf<{a: 1; b: 2}>()
                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<{a: {b: 1} & {c: 1}}>().toEqualTypeOf<{a: {b: 1; c: 1}}>()
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/usage.test.ts:999:99 - error TS2344: Type '() => () => () => () => 2' does not satisfy the constraint '() => () => () => () => 1'.
      Call signature return types '() => () => () => 2' and '() => () => () => 1' are incompatible.
        Call signature return types '() => () => 2' and '() => () => 1' are incompatible.
          Call signature return types '() => 2' and '() => 1' are incompatible.
            Type '2' is not assignable to type '1'.

    999   expectTypeOf<() => () => () => () => 1>().toEqualTypeOf<() => () => () => () => 2>()
                                                                  ~~~~~~~~~~~~~~~~~~~~~~~~~
    test/usage.test.ts:999:99 - error TS2554: Expected 1 arguments, but got 0.

    999   expectTypeOf<() => () => () => () => {a: 1} & {b: 2}>().toEqualTypeOf<
                                                                  ~~~~~~~~~~~~~~
    341     () => () => () => () => {a: 1; b: 2}
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    342   >()
        ~~~~~

      src/index.ts:999:9
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    "
  `)
})
