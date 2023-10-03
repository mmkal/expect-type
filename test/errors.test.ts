import * as fs from 'fs'
import {tsErrors, tsFileErrors} from './ts-output'

test('toEqualTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

    999 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
                                           ~~~~~~~~~~~"
  `)
})

test('toEqualTypeOf(...) error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2345: Argument of type '{ a: string; }' is not assignable to parameter of type 'Mismatch'.
      Object literal may only specify known properties, and 'a' does not exist in type 'Mismatch'.

    999 expectTypeOf({a: 1}).toEqualTypeOf({a: 'one'})
                                            ~~~~~~~~"
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
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: never\\"'.

    999 expectTypeOf<{a: never}>().toEqualTypeOf<{a: 1}>()
                                                 ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: unknown\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: unknown\\"'.

    999 expectTypeOf<{a: unknown}>().toEqualTypeOf<{a: 1}>()
                                                   ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: any; }' does not satisfy the constraint '{ a: never; }'.
      Types of property 'a' are incompatible.
        Type 'any' is not assignable to type 'never'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: any}>()
                                             ~~~~~~~~
    test/test.ts:999:999 - error TS2554: Expected 1 arguments, but got 0.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: never}>()
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~

      src/index.ts:999:999
        999       ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Arguments for the rest parameter 'MISMATCH' were not provided.
    test/test.ts:999:999 - error TS2344: Type '{ a: unknown; }' does not satisfy the constraint '{ a: \\"Expected: unknown, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'unknown' is not assignable to type '\\"Expected: unknown, Actual: never\\"'.

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
    "test/test.ts:999:999 - error TS2344: Type '{ a: \\"abc\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: abc, Actual: string\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"abc\\"' is not assignable to type '\\"Expected: literal string: abc, Actual: string\\"'.

    999 expectTypeOf<{a: string}>().toEqualTypeOf<{a: 'abc'}>()
                                                  ~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: never\\"'.

    999 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: string}>()
                                                 ~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: \\"xyz\\"; }' does not satisfy the constraint '{ a: \\"Expected: literal string: xyz, Actual: literal string: abc\\"; }'.
      Types of property 'a' are incompatible.
        Type '\\"xyz\\"' is not assignable to type '\\"Expected: literal string: xyz, Actual: literal string: abc\\"'.

    999 expectTypeOf<{a: 'abc'}>().toEqualTypeOf<{a: 'xyz'}>()
                                                 ~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 1; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 1, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type '1' is not assignable to type '\\"Expected: literal number: 1, Actual: number\\"'.

    999 expectTypeOf<{a: number}>().toEqualTypeOf<{a: 1}>()
                                                  ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: number; }' does not satisfy the constraint '{ a: \\"Expected: number, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'number' is not assignable to type '\\"Expected: number, Actual: never\\"'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: number}>()
                                             ~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: 2; }' does not satisfy the constraint '{ a: \\"Expected: literal number: 2, Actual: literal number: 1\\"; }'.
      Types of property 'a' are incompatible.
        Type '2' is not assignable to type '\\"Expected: literal number: 2, Actual: literal number: 1\\"'.

    999 expectTypeOf<{a: 1}>().toEqualTypeOf<{a: 2}>()
                                             ~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: true; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: true, Actual: literal boolean: false\\"; }'.
      Types of property 'a' are incompatible.
        Type 'true' is not assignable to type '\\"Expected: literal boolean: true, Actual: literal boolean: false\\"'.

    999 expectTypeOf<{a: boolean}>().toEqualTypeOf<{a: true}>()
                                                   ~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: boolean; }' does not satisfy the constraint '{ a: \\"Expected: boolean, Actual: never\\"; }'.
      Types of property 'a' are incompatible.
        Type 'boolean' is not assignable to type '\\"Expected: boolean, Actual: never\\"'.

    999 expectTypeOf<{a: true}>().toEqualTypeOf<{a: boolean}>()
                                                ~~~~~~~~~~~~
    test/test.ts:999:999 - error TS2344: Type '{ a: false; }' does not satisfy the constraint '{ a: \\"Expected: literal boolean: false, Actual: literal boolean: true\\"; }'.
      Types of property 'a' are incompatible.
        Type 'false' is not assignable to type '\\"Expected: literal boolean: false, Actual: literal boolean: true\\"'.

    999 expectTypeOf<{a: true}>().toEqualTypeOf<{a: false}>()
                                                ~~~~~~~~~~"
  `)
})

test('toMatchTypeOf<...>() error message', async () => {
  expect(tsErrors(`expectTypeOf({a: 1}).toMatchTypeOf<{a: string}>()`)).toMatchInlineSnapshot(`
    "test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
      Types of property 'a' are incompatible.
        Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

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
    "test/test.ts:999:999 - error TS2344: Type '[[number], [2], []]' does not satisfy the constraint '{ [x: number]: { [x: number]: number; [iterator]: (() => IterableIterator<1>) | (() => IterableIterator<number>) | (() => IterableIterator<never>); [unscopables]: (() => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }) | (() => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }) | (() => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }); length: 0 | 1; toString: (() => string) | (() => string) | (() => string); concat: { (...items: ConcatArray<1>[]): 1[]; (...items: (1 | ConcatArray<1>)[]): 1[]; } | { (...items: ConcatArray<number>[]): number[]; (...items: (number | ConcatArray<number>)[]): number[]; } | { (...items: ConcatArray<never>[]): never[]; (...items: ConcatArray<never>[]): never[]; }; indexOf: ((searchElement: 1, fromIndex?: number | undefined) => number) | ((searchElement: number, fromIndex?: number | undefined) => number) | ((searchElement: never, fromIndex?: number | undefined) => number); lastIndexOf: ((searchElement: 1, fromIndex?: number | undefined) => number) | ((searchElement: number, fromIndex?: number | undefined) => number) | ((searchElement: never, fromIndex?: number | undefined) => number); slice: ((start?: number | undefined, end?: number | undefined) => 1[]) | ((start?: number | undefined, end?: number | undefined) => number[]) | ((start?: number | undefined, end?: number | undefined) => never[]); includes: ((searchElement: 1, fromIndex?: number | undefined) => boolean) | ((searchElement: number, fromIndex?: number | undefined) => boolean) | ((searchElement: never, fromIndex?: number | undefined) => boolean); toLocaleString: (() => string) | (() => string) | (() => string); join: ((separator?: string | undefined) => string) | ((separator?: string | undefined) => string) | ((separator?: string | undefined) => string); every: { <S extends 1>(predicate: (value: 1, index: number, array: 1[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: 1, index: number, array: 1[]) => unknown, thisArg?: any): boolean; } | { <S extends number>(predicate: (value: number, index: number, array: number[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: number, index: number, array: number[]) => unknown, thisArg?: any): boolean; } | { <S extends never>(predicate: (value: never, index: number, array: never[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: never, index: number, array: never[]) => unknown, thisArg?: any): boolean; }; some: ((predicate: (value: 1, index: number, array: 1[]) => unknown, thisArg?: any) => boolean) | ((predicate: (value: number, index: number, array: number[]) => unknown, thisArg?: any) => boolean) | ((predicate: (value: never, index: number, array: never[]) => unknown, thisArg?: any) => boolean); forEach: ((callbackfn: (value: 1, index: number, array: 1[]) => void, thisArg?: any) => void) | ((callbackfn: (value: number, index: number, array: number[]) => void, thisArg?: any) => void) | ((callbackfn: (value: never, index: number, array: never[]) => void, thisArg?: any) => void); map: (<U>(callbackfn: (value: 1, index: number, array: 1[]) => U, thisArg?: any) => U[]) | (<U>(callbackfn: (value: number, index: number, array: number[]) => U, thisArg?: any) => U[]) | (<U>(callbackfn: (value: never, index: number, array: never[]) => U, thisArg?: any) => U[]); filter: \\"Expected: function, Actual: never\\"; reduce: { (callbackfn: (previousValue: 1, currentValue: 1, currentIndex: number, array: 1[]) => 1): 1; (callbackfn: (previousValue: 1, currentValue: 1, currentIndex: number, array: 1[]) => 1, initialValue: 1): 1; <U>(callbackfn: (previousValue: U, currentValue: 1, currentIndex: number, array: 1[]) => U, initialValue: U): U; } | { (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number): number; (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number, initialValue: number): number; <U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: number[]) => U, initialValue: U): U; } | { (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never): never; (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never, initialValue: never): never; <U>(callbackfn: (previousValue: U, currentValue: never, currentIndex: number, array: never[]) => U, initialValue: U): U; }; reduceRight: { (callbackfn: (previousValue: 1, currentValue: 1, currentIndex: number, array: 1[]) => 1): 1; (callbackfn: (previousValue: 1, currentValue: 1, currentIndex: number, array: 1[]) => 1, initialValue: 1): 1; <U>(callbackfn: (previousValue: U, currentValue: 1, currentIndex: number, array: 1[]) => U, initialValue: U): U; } | { (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number): number; (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number, initialValue: number): number; <U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: number[]) => U, initialValue: U): U; } | { (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never): never; (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never, initialValue: never): never; <U>(callbackfn: (previousValue: U, currentValue: never, currentIndex: number, array: never[]) => U, initialValue: U): U; }; find: \\"Expected: function, Actual: never\\"; findIndex: ((predicate: (value: 1, index: number, obj: 1[]) => unknown, thisArg?: any) => number) | ((predicate: (value: number, index: number, obj: number[]) => unknown, thisArg?: any) => number) | ((predicate: (value: never, index: number, obj: never[]) => unknown, thisArg?: any) => number); entries: (() => IterableIterator<[number, 1]>) | (() => IterableIterator<[number, number]>) | (() => IterableIterator<[number, never]>); keys: (() => IterableIterator<number>) | (() => IterableIterator<number>) | (() => IterableIterator<number>); values: (() => IterableIterator<1>) | (() => IterableIterator<number>) | (() => IterableIterator<never>); pop: (() => 1 | undefined) | (() => number | undefined) | (() => undefined); push: ((...items: 1[]) => number) | ((...items: number[]) => number) | ((...items: never[]) => number); reverse: (() => 1[]) | (() => number[]) | (() => never[]); shift: (() => 1 | undefined) | (() => number | undefined) | (() => undefined); sort: \\"Expected: function, Actual: never\\"; splice: { (start: number, deleteCount?: number | undefined): 1[]; (start: number, deleteCount: number, ...items: 1[]): 1[]; } | { (start: number, deleteCount?: number | undefined): number[]; (start: number, deleteCount: number, ...items: number[]): number[]; } | { (start: number, deleteCount?: number | undefined): never[]; (start: number, deleteCount: number, ...items: never[]): never[]; }; unshift: ((...items: 1[]) => number) | ((...items: number[]) => number) | ((...items: never[]) => number); fill: ((value: 1, start?: number | undefined, end?: number | undefined) => [1]) | ((value: number, start?: number | undefined, end?: number | undefined) => [number]) | ((value: never, start?: number | undefined, end?: number | undefined) => []); copyWithin: ((target: number, start: number, end?: number | undefined) => [1]) | ((target: number, start: number, end?: number | undefined) => [number]) | ((target: number, start: number, end?: number | undefined) => []); }; [iterator]: () => IterableIterator<[] | [number] | [1]>; [unscopables]: () => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }; length: 3; toString: () => string; concat: { (...items: ConcatArray<[] | [number] | [1]>[]): ([] | [number] | [1])[]; (...items: ([] | [number] | [1] | ConcatArray<[] | [number] | [1]>)[]): ([] | [number] | [1])[]; }; indexOf: (searchElement: [] | [number] | [1], fromIndex?: number | undefined) => number; lastIndexOf: (searchElement: [] | [number] | [1], fromIndex?: number | undefined) => number; slice: (start?: number | undefined, end?: number | undefined) => ([] | [number] | [1])[]; includes: (searchElement: [] | [number] | [1], fromIndex?: number | undefined) => boolean; toLocaleString: () => string; join: (separator?: string | undefined) => string; every: { <S extends [] | [number] | [1]>(predicate: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => unknown, thisArg?: any): boolean; }; some: (predicate: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => unknown, thisArg?: any) => boolean; forEach: (callbackfn: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => void, thisArg?: any) => void; map: <U>(callbackfn: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => U, thisArg?: any) => U[]; filter: { <S extends [] | [number] | [1]>(predicate: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => value is S, thisArg?: any): S[]; (predicate: (value: [] | [number] | [1], index: number, array: ([] | [number] | [1])[]) => unknown, thisArg?: any): ([] | [number] | [1])[]; }; reduce: { (callbackfn: (previousValue: [] | [number] | [1], currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => [] | [number] | [1]): [] | [number] | [1]; (callbackfn: (previousValue: [] | [number] | [1], currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => [] | [number] | [1], initialValue: [] | [number] | [1]): [] | [number] | [1]; <U>(callbackfn: (previousValue: U, currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => U, initialValue: U): U; }; reduceRight: { (callbackfn: (previousValue: [] | [number] | [1], currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => [] | [number] | [1]): [] | [number] | [1]; (callbackfn: (previousValue: [] | [number] | [1], currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => [] | [number] | [1], initialValue: [] | [number] | [1]): [] | [number] | [1]; <U>(callbackfn: (previousValue: U, currentValue: [] | [number] | [1], currentIndex: number, array: ([] | [number] | [1])[]) => U, initialValue: U): U; }; find: { <S extends [] | [number] | [1]>(predicate: (this: void, value: [] | [number] | [1], index: number, obj: ([] | [number] | [1])[]) => value is S, thisArg?: any): S | undefined; (predicate: (value: [] | [number] | [1], index: number, obj: ([] | [number] | [1])[]) => unknown, thisArg?: any): [] | [number] | [1] | undefined; }; findIndex: (predicate: (value: [] | [number] | [1], index: number, obj: ([] | [number] | [1])[]) => unknown, thisArg?: any) => number; entries: () => IterableIterator<[number, [] | [number] | [1]]>; keys: () => IterableIterator<number>; values: () => IterableIterator<[] | [number] | [1]>; pop: () => [] | [number] | [1] | undefined; push: (...items: ([] | [number] | [1])[]) => number; reverse: () => ([] | [number] | [1])[]; shift: () => [] | [number] | [1] | undefined; sort: \\"Expected: function, Actual: function\\"; splice: { (start: number, deleteCount?: number | undefined): ([] | [number] | [1])[]; (start: number, deleteCount: number, ...items: ([] | [number] | [1])[]): ([] | [number] | [1])[]; }; unshift: (...items: ([] | [number] | [1])[]) => number; fill: \\"Expected: function, Actual: function\\"; copyWithin: \\"Expected: function, Actual: function\\"; 0: { [x: number]: number; [iterator]: () => IterableIterator<number>; [unscopables]: () => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }; length: 1; toString: () => string; concat: { (...items: ConcatArray<number>[]): number[]; (...items: (number | ConcatArray<number>)[]): number[]; }; indexOf: (searchElement: number, fromIndex?: number | undefined) => number; lastIndexOf: (searchElement: number, fromIndex?: number | undefined) => number; slice: (start?: number | undefined, end?: number | undefined) => number[]; includes: (searchElement: number, fromIndex?: number | undefined) => boolean; toLocaleString: () => string; join: (separator?: string | undefined) => string; every: { <S extends number>(predicate: (value: number, index: number, array: number[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: number, index: number, array: number[]) => unknown, thisArg?: any): boolean; }; some: (predicate: (value: number, index: number, array: number[]) => unknown, thisArg?: any) => boolean; forEach: (callbackfn: (value: number, index: number, array: number[]) => void, thisArg?: any) => void; map: <U>(callbackfn: (value: number, index: number, array: number[]) => U, thisArg?: any) => U[]; filter: { <S extends number>(predicate: (value: number, index: number, array: number[]) => value is S, thisArg?: any): S[]; (predicate: (value: number, index: number, array: number[]) => unknown, thisArg?: any): number[]; }; reduce: { (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number): number; (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number, initialValue: number): number; <U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: number[]) => U, initialValue: U): U; }; reduceRight: { (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number): number; (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: number[]) => number, initialValue: number): number; <U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: number[]) => U, initialValue: U): U; }; find: { <S extends number>(predicate: (this: void, value: number, index: number, obj: number[]) => value is S, thisArg?: any): S | undefined; (predicate: (value: number, index: number, obj: number[]) => unknown, thisArg?: any): number | undefined; }; findIndex: (predicate: (value: number, index: number, obj: number[]) => unknown, thisArg?: any) => number; entries: () => IterableIterator<[number, number]>; keys: () => IterableIterator<number>; values: () => IterableIterator<number>; pop: () => number | undefined; push: (...items: number[]) => number; reverse: () => number[]; shift: () => number | undefined; sort: (compareFn?: ((a: number, b: number) => number) | undefined) => [number]; splice: { (start: number, deleteCount?: number | undefined): number[]; (start: number, deleteCount: number, ...items: number[]): number[]; }; unshift: (...items: number[]) => number; fill: (value: number, start?: number | undefined, end?: number | undefined) => [number]; copyWithin: (target: number, start: number, end?: number | undefined) => [number]; 0: number; }; 1: { [x: number]: \\"Expected: literal number: 2, Actual: literal number: 1\\"; [iterator]: \\"Expected: function, Actual: function\\"; [unscopables]: () => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }; length: 1; toString: () => string; concat: \\"Expected: function, Actual: function\\"; indexOf: \\"Expected: function, Actual: function\\"; lastIndexOf: \\"Expected: function, Actual: function\\"; slice: \\"Expected: function, Actual: function\\"; includes: \\"Expected: function, Actual: function\\"; toLocaleString: () => string; join: (separator?: string | undefined) => string; every: \\"Expected: function, Actual: function\\"; some: \\"Expected: function, Actual: function\\"; forEach: \\"Expected: function, Actual: function\\"; map: \\"Expected: function, Actual: function\\"; filter: \\"Expected: function, Actual: function\\"; reduce: \\"Expected: function, Actual: function\\"; reduceRight: \\"Expected: function, Actual: function\\"; find: \\"Expected: function, Actual: function\\"; findIndex: \\"Expected: function, Actual: function\\"; entries: \\"Expected: function, Actual: function\\"; keys: () => IterableIterator<number>; values: \\"Expected: function, Actual: function\\"; pop: \\"Expected: function, Actual: function\\"; push: \\"Expected: function, Actual: function\\"; reverse: \\"Expected: function, Actual: function\\"; shift: \\"Expected: function, Actual: function\\"; sort: \\"Expected: function, Actual: function\\"; splice: \\"Expected: function, Actual: function\\"; unshift: \\"Expected: function, Actual: function\\"; fill: \\"Expected: function, Actual: function\\"; copyWithin: \\"Expected: function, Actual: function\\"; 0: \\"Expected: literal number: 2, Actual: literal number: 1\\"; }; 2: { [x: number]: never; [iterator]: () => IterableIterator<never>; [unscopables]: () => { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }; length: 0; toString: () => string; concat: { (...items: ConcatArray<never>[]): never[]; (...items: ConcatArray<never>[]): never[]; }; indexOf: (searchElement: never, fromIndex?: number | undefined) => number; lastIndexOf: (searchElement: never, fromIndex?: number | undefined) => number; slice: (start?: number | undefined, end?: number | undefined) => never[]; includes: (searchElement: never, fromIndex?: number | undefined) => boolean; toLocaleString: () => string; join: (separator?: string | undefined) => string; every: { <S extends never>(predicate: (value: never, index: number, array: never[]) => value is S, thisArg?: any): this is S[]; (predicate: (value: never, index: number, array: never[]) => unknown, thisArg?: any): boolean; }; some: (predicate: (value: never, index: number, array: never[]) => unknown, thisArg?: any) => boolean; forEach: (callbackfn: (value: never, index: number, array: never[]) => void, thisArg?: any) => void; map: <U>(callbackfn: (value: never, index: number, array: never[]) => U, thisArg?: any) => U[]; filter: { <S extends never>(predicate: (value: never, index: number, array: never[]) => value is S, thisArg?: any): S[]; (predicate: (value: never, index: number, array: never[]) => unknown, thisArg?: any): never[]; }; reduce: { (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never): never; (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never, initialValue: never): never; <U>(callbackfn: (previousValue: U, currentValue: never, currentIndex: number, array: never[]) => U, initialValue: U): U; }; reduceRight: { (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never): never; (callbackfn: (previousValue: never, currentValue: never, currentIndex: number, array: never[]) => never, initialValue: never): never; <U>(callbackfn: (previousValue: U, currentValue: never, currentIndex: number, array: never[]) => U, initialValue: U): U; }; find: { <S extends never>(predicate: (this: void, value: never, index: number, obj: never[]) => value is S, thisArg?: any): S | undefined; (predicate: (value: never, index: number, obj: never[]) => unknown, thisArg?: any): undefined; }; findIndex: (predicate: (value: never, index: number, obj: never[]) => unknown, thisArg?: any) => number; entries: () => IterableIterator<[number, never]>; keys: () => IterableIterator<number>; values: () => IterableIterator<never>; pop: () => undefined; push: (...items: never[]) => number; reverse: () => never[]; shift: () => undefined; sort: (compareFn?: ((a: never, b: never) => number) | undefined) => []; splice: { (start: number, deleteCount?: number | undefined): never[]; (start: number, deleteCount: number, ...items: never[]): never[]; }; unshift: (...items: never[]) => number; fill: (value: never, start?: number | undefined, end?: number | undefined) => []; copyWithin: (target: number, start: number, end?: number | undefined) => []; }; }'.
      Types of property 'sort' are incompatible.
        Type '(compareFn?: ((a: [] | [number] | [2], b: [] | [number] | [2]) => number) | undefined) => [[number], [2], []]' is not assignable to type '\\"Expected: function, Actual: function\\"'.

    999 expectTypeOf<[[number], [1], []]>().toEqualTypeOf<[[number], [2], []]>()
                                                          ~~~~~~~~~~~~~~~~~~~"
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
