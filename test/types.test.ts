/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {expect, test} from 'vitest'
import * as a from '../src/index'
import type {UnionToIntersection} from '../src/index'
import type {
  ConstructorOverloadParameters,
  OverloadParameters,
  OverloadReturnTypes,
  OverloadsInfoUnion,
  OverloadsNarrowedByParameters,
} from '../src/overloads'

const {expectTypeOf} = a

test('boolean type logic', () => {
  expectTypeOf<a.And<[true, true]>>().toEqualTypeOf<true>()
  expectTypeOf<a.And<[true, true]>>().toEqualTypeOf<true>()
  expectTypeOf<a.And<[true, false]>>().toEqualTypeOf<false>()
  expectTypeOf<a.And<[false, true]>>().toEqualTypeOf<false>()
  expectTypeOf<a.And<[false, false]>>().toEqualTypeOf<false>()

  expectTypeOf<a.Or<[true, true]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Or<[true, false]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Or<[false, true]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Or<[false, false]>>().toEqualTypeOf<false>()

  expectTypeOf<a.Xor<[true, true]>>().toEqualTypeOf<false>()
  expectTypeOf<a.Xor<[true, false]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Xor<[false, true]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Xor<[false, false]>>().toEqualTypeOf<false>()

  expectTypeOf<a.Not<true>>().toEqualTypeOf<false>()
  expectTypeOf<a.Not<false>>().toEqualTypeOf<true>()

  expectTypeOf<a.IsAny<any>>().toEqualTypeOf<true>()
  expectTypeOf<a.IsUnknown<any>>().toEqualTypeOf<false>()
  expectTypeOf<a.IsNever<any>>().toEqualTypeOf<false>()

  expectTypeOf<a.IsAny<unknown>>().toEqualTypeOf<false>()
  expectTypeOf<a.IsUnknown<unknown>>().toEqualTypeOf<true>()
  expectTypeOf<a.IsNever<unknown>>().toEqualTypeOf<false>()

  expectTypeOf<a.IsAny<never>>().toEqualTypeOf<false>()
  expectTypeOf<a.IsUnknown<never>>().toEqualTypeOf<false>()
  expectTypeOf<a.IsNever<never>>().toEqualTypeOf<true>()

  expectTypeOf<a.Extends<1, number>>().toEqualTypeOf<true>()
  expectTypeOf<a.Extends<number, 1>>().toEqualTypeOf<false>()

  expectTypeOf<a.StrictEqualUsingBranding<1, 1, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<1, number, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<false>()
  expectTypeOf<a.StrictEqualUsingBranding<{a: 1}, {a: 1}, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<[{a: 1}], [{a: 1}], a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<never, never, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<any, any, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<unknown, unknown, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<true>()
  expectTypeOf<a.StrictEqualUsingBranding<any, never, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<false>()
  expectTypeOf<a.StrictEqualUsingBranding<any, unknown, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<false>()
  expectTypeOf<a.StrictEqualUsingBranding<never, unknown, a.DeepBrandOptionsDefaults>>().toEqualTypeOf<false>()
})

test(`never types don't sneak by`, () => {
  // @ts-expect-error
  expectTypeOf<never>().toBeNumber()

  // @ts-expect-error
  expectTypeOf<never>().toBeString()

  // @ts-expect-error
  expectTypeOf<never>().toBeAny()

  // @ts-expect-error
  expectTypeOf<never>().toBeUnknown()

  // @ts-expect-error
  expectTypeOf<never>().toEqualTypeOf<{foo: string}>()

  // @ts-expect-error
  expectTypeOf<never>().toMatchTypeOf<{foo: string}>()
})

test("any/never types don't break toEqualTypeOf or toMatchTypeOf", () => {
  // @ts-expect-error
  expectTypeOf<never>().toEqualTypeOf<any>()
  // @ts-expect-error
  expectTypeOf<never>().toEqualTypeOf<unknown>()
  // @ts-expect-error
  expectTypeOf<any>().toEqualTypeOf<never>()
  // @ts-expect-error
  expectTypeOf<any>().toEqualTypeOf<unknown>()
  // @ts-expect-error
  expectTypeOf<unknown>().toEqualTypeOf<any>()
  // @ts-expect-error
  expectTypeOf<unknown>().toEqualTypeOf<never>()
  // @ts-expect-error
  expectTypeOf<{a: number}>().toEqualTypeOf<any>()
  // @ts-expect-error
  expectTypeOf<{a: number}>().toEqualTypeOf<never>()
  // @ts-expect-error
  expectTypeOf<{a: number}>().toEqualTypeOf<unknown>()
  // @ts-expect-error
  expectTypeOf<any>().toEqualTypeOf({a: 1, b: 1})
  // @ts-expect-error
  expectTypeOf<never>().toEqualTypeOf({a: 1, b: 1})
  // @ts-expect-error
  expectTypeOf<unknown>().toEqualTypeOf({a: 1, b: 1})
})

test('intersections do not currently work properly', () => {
  // @ts-expect-error limitation of new implementation https://github.com/mmkal/expect-type/pull/21
  expectTypeOf<{a: 1} & {b: 2}>().toEqualTypeOf<{a: 1; b: 2}>()
  expectTypeOf<{a: 1} & {b: 2}>().toMatchTypeOf<{a: 1; b: 2}>()
  // @ts-expect-error limitation of new implementation https://github.com/mmkal/expect-type/pull/21
  expectTypeOf<{a: 1; b: 2}>().toEqualTypeOf<{a: 1} & {b: 2}>()
  expectTypeOf<{a: 1; b: 2}>().toMatchTypeOf<{a: 1} & {b: 2}>()
})

test('not cannot be chained', () => {
  // @ts-expect-error
  expectTypeOf<number>().not.not.toBeNumber()
})

test('constructor params', () => {
  // The built-in ConstructorParameters type helper fails to pick up no-argument overloads.
  // This test checks that's still the case to avoid unnecessarily maintaining a workaround,
  // in case it's fixed in a future version

  // unhelpful built-in behaviour:
  expectTypeOf<ConstructorParameters<typeof Date>>().toEqualTypeOf<[string | number | Date]>()
  expectTypeOf<typeof Date extends new (...args: infer Args) => any ? Args : never>().toEqualTypeOf<
    [string | number | Date]
  >()

  // workaround:
  expectTypeOf<ConstructorOverloadParameters<typeof Date>>().toEqualTypeOf<
    | []
    | [value: string | number | Date]
    | [value: string | number]
    | [
        year: number,
        monthIndex: number,
        date?: number | undefined,
        hours?: number | undefined,
        minutes?: number | undefined,
        seconds?: number | undefined,
        ms?: number | undefined,
      ]
  >()
})

test('guarded & asserted types', () => {
  expectTypeOf<(v: any) => v is string>().guards.toBeString()
  expectTypeOf<(v: any) => asserts v is number>().asserts.toBeNumber()
  // @ts-expect-error
  expectTypeOf<(v: any) => boolean>().guards.toBeAny()
  // @ts-expect-error
  expectTypeOf<(v: any) => boolean>().asserts.toBeAny()
})

test('parity with IsExact from conditional-type-checks', () => {
  // lifted from https://github.com/dsherret/conditional-type-checks/blob/01215056e8b97a28c5b0311b42ed48c70c8723fe/tests.ts#L18-L63
  // there are some redundant type constituents, but dont' fix them because they came from above and it'll make updating harder
  /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

  /** shim conditional-type-check's `assert` */
  const assert = <T extends boolean>(_result: T) => true
  /** shim conditional-type-check's `IsExact` using `Equal` */
  type IsExact<T, U> = a.StrictEqualUsingBranding<T, U, a.DeepBrandOptionsDefaults>

  // basic test for `assert` shim:
  expectTypeOf(assert).toBeCallableWith(true)
  expectTypeOf(assert).toBeCallableWith(false)
  expectTypeOf(assert).returns.toBeBoolean()

  // basic test for `IsExact` shim:
  expectTypeOf<IsExact<0, 0>>().toEqualTypeOf<true>()
  expectTypeOf<IsExact<0, 1>>().toEqualTypeOf<false>()

  // test for false negatives in shims:

  // @ts-expect-error
  expectTypeOf<IsExact<0, 0>>().toEqualTypeOf<false>()
  // @ts-expect-error
  expectTypeOf<IsExact<0, 1>>().toEqualTypeOf<true>()
  // @ts-expect-error
  assert<IsExact<0, 0>>(false)
  // @ts-expect-error
  assert<IsExact<0, 1>>(true)

  // conditional-type-check `IsExact` tests, copy-pasted directly:

  // matching
  assert<IsExact<string | number, string | number>>(true)
  assert<IsExact<string | number | Date, string | number | Date>>(true)
  assert<IsExact<string | undefined, string | undefined>>(true)
  assert<IsExact<any, any>>(true) // ok to have any for both
  assert<IsExact<unknown, unknown>>(true)
  assert<IsExact<never, never>>(true)
  assert<IsExact<{}, {}>>(true)
  assert<IsExact<{prop: string}, {prop: string}>>(true)
  assert<IsExact<{prop: {prop: string}}, {prop: {prop: string}}>>(true)
  assert<IsExact<{prop: never}, {prop: never}>>(true)
  assert<IsExact<{prop: any}, {prop: any}>>(true)
  assert<IsExact<{prop: unknown}, {prop: unknown}>>(true)
  assert<IsExact<Window, Window>>(true)

  // not matching
  assert<IsExact<string | number | Date, string | number>>(false)
  assert<IsExact<string, string | number>>(false)
  assert<IsExact<string | undefined, string>>(false)
  assert<IsExact<string | undefined, any | string>>(false)
  assert<IsExact<any | string | undefined, string>>(false)
  assert<IsExact<string, any>>(false)
  assert<IsExact<string, unknown>>(false)
  assert<IsExact<string, never>>(false)
  assert<IsExact<never, never | string>>(false)
  assert<IsExact<unknown, any>>(false)
  assert<IsExact<never, any>>(false)
  assert<IsExact<MouseEvent | Window, MouseEvent>>(false)
  assert<IsExact<{name: string; other?: Date}, {name: string}>>(false)
  assert<IsExact<{prop: Date}, {prop: string}>>(false)
  assert<IsExact<{other?: Date}, {prop?: string}>>(false)
  assert<IsExact<{prop: {prop?: string}}, {prop: {prop: string}}>>(false)
  assert<IsExact<{prop: any}, {prop: string}>>(false)
  assert<IsExact<{prop: any}, {prop: unknown}>>(false)
  assert<IsExact<{prop: any}, {prop: never}>>(false)
  assert<IsExact<{prop: unknown}, {prop: never}>>(false)
  assert<IsExact<{prop: {prop: unknown}}, {prop: {prop: any}}>>(false)
  assert<IsExact<{prop: {prop: unknown}}, {prop: {prop: never}}>>(false)
  assert<IsExact<{prop: {prop: any}}, {prop: {prop: never}}>>(false)
  assert<IsExact<{prop: string}, {prop: never}>>(false)
  assert<IsExact<{prop: {prop: any}}, {prop: {prop: string}}>>(false)
  assert<IsExact<{prop: any} | {prop: string}, {prop: number} | {prop: string}>>(false)
  assert<IsExact<{prop: string | undefined}, {prop?: string}>>(false) // these are different
})

test('Equal works with functions', () => {
  expectTypeOf<
    a.StrictEqualUsingBranding<() => void, () => string, a.DeepBrandOptionsDefaults>
  >().toEqualTypeOf<false>()
  expectTypeOf<
    a.StrictEqualUsingBranding<() => void, (s: string) => void, a.DeepBrandOptionsDefaults>
  >().toEqualTypeOf<false>()
  expectTypeOf<
    a.StrictEqualUsingBranding<() => () => () => void, () => (s: string) => () => void, a.DeepBrandOptionsDefaults>
  >().toEqualTypeOf<false>()
})

test(`undefined isn't removed from unions`, () => {
  expectTypeOf<string | null | undefined>().toEqualTypeOf('' as string | null | undefined)
  expectTypeOf<string | null | undefined>().toMatchTypeOf('' as string | null | undefined)

  expectTypeOf('' as string | null | undefined).toEqualTypeOf<string | null | undefined>()
  expectTypeOf('' as string | null | undefined).toMatchTypeOf<string | null | undefined>()

  expectTypeOf<string | null | undefined>().toEqualTypeOf<string | null | undefined>()
  expectTypeOf<string | null | undefined>().toMatchTypeOf<string | null | undefined>()
})

test('Distinguish between functions whose return types differ by readonly prop', () => {
  type ObjWithReadonlyProp = {readonly x: number}
  type ObjWithoutReadonlyProp = {x: number}

  function original(o: ObjWithReadonlyProp): ObjWithReadonlyProp {
    return o
  }

  function same(o: ObjWithReadonlyProp): ObjWithReadonlyProp {
    return o
  }

  function different(o: ObjWithoutReadonlyProp): ObjWithoutReadonlyProp {
    return o
  }

  // Self-identity
  expectTypeOf<typeof original>().toEqualTypeOf<typeof original>()
  expectTypeOf(original).branded.toEqualTypeOf<typeof original>()
  expectTypeOf<typeof different>().toEqualTypeOf<typeof different>()
  expectTypeOf(different).toEqualTypeOf(different)
  // @ts-expect-error
  expectTypeOf<typeof original>().not.toEqualTypeOf<typeof original>()
  // @ts-expect-error
  expectTypeOf(original).not.toEqualTypeOf(original)
  // @ts-expect-error
  expectTypeOf<typeof different>().not.toEqualTypeOf<typeof different>()
  // @ts-expect-error
  expectTypeOf(different).not.toEqualTypeOf(different)

  // Same shape
  expectTypeOf<typeof original>().toEqualTypeOf<typeof same>()
  expectTypeOf(original).toEqualTypeOf(same)
  // @ts-expect-error
  expectTypeOf<typeof original>().not.toEqualTypeOf<typeof same>()
  // @ts-expect-error
  expectTypeOf(original).not.toEqualTypeOf(same)

  // Different presence of readonly prop
  expectTypeOf<typeof original>().not.toEqualTypeOf<typeof different>()
  expectTypeOf(original).not.toEqualTypeOf(different)
  // @ts-expect-error
  expectTypeOf<typeof original>().toEqualTypeOf<typeof different>()
  // @ts-expect-error
  expectTypeOf(original).toEqualTypeOf(different)

  // not and branded can't be combined
  // @ts-expect-error
  expectTypeOf<{}>().not.branded
  // @ts-expect-error
  expectTypeOf<{}>().branded.not
})

test('Distinguish between classes with only private properties', () => {
  class Original {
    private readonly prop = 1
  }

  class Different {
    private readonly prop = 1
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf(Original).toEqualTypeOf(Original)
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  expectTypeOf(Different).toEqualTypeOf(Different)
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf(Original).not.toEqualTypeOf(Original)
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf(Different).not.toEqualTypeOf(Different)

  // Different classes
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  expectTypeOf(Original).not.toEqualTypeOf(Different)
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf(Original).toEqualTypeOf(Different)
})

test('Distinguish between types with generics used in type assertion', () => {
  interface Guard<T> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (arg: unknown): arg is T
  }

  // Self-identity
  expectTypeOf<Guard<number>>().toEqualTypeOf<Guard<number>>()
  // @ts-expect-error
  expectTypeOf<Guard<number>>().not.toEqualTypeOf<Guard<number>>()

  // Different return types
  expectTypeOf<Guard<number>>().not.toEqualTypeOf<Guard<string>>()
  // @ts-expect-error
  expectTypeOf<Guard<number>>().toEqualTypeOf<Guard<string>>()
})

test('Distinguish between functions with generics vs unknown', () => {
  function funcWithGenerics<T>(p1: T, p2: T): T {
    return p1 || p2
  }

  function funcWithUnknown(p1: unknown, p2: unknown): unknown {
    return p1 || p2
  }

  // Self-identity
  expectTypeOf<typeof funcWithGenerics>().toEqualTypeOf<typeof funcWithGenerics>()
  expectTypeOf(funcWithGenerics).toEqualTypeOf(funcWithGenerics)
  expectTypeOf<typeof funcWithUnknown>().toEqualTypeOf<typeof funcWithUnknown>()
  expectTypeOf(funcWithUnknown).toEqualTypeOf(funcWithUnknown)
  // @ts-expect-error
  expectTypeOf<typeof funcWithGenerics>().not.toEqualTypeOf<typeof funcWithGenerics>()
  // @ts-expect-error
  expectTypeOf(funcWithGenerics).not.toEqualTypeOf(funcWithGenerics)
  // @ts-expect-error
  expectTypeOf<typeof funcWithUnknown>().not.toEqualTypeOf<typeof funcWithUnknown>()
  // @ts-expect-error
  expectTypeOf(funcWithUnknown).not.toEqualTypeOf(funcWithUnknown)

  // Generic vs unknown with otherwise same shape
  expectTypeOf<typeof funcWithGenerics>().not.toEqualTypeOf<typeof funcWithUnknown>()
  expectTypeOf(funcWithGenerics).not.toEqualTypeOf(funcWithUnknown)
  // @ts-expect-error
  expectTypeOf<typeof funcWithGenerics>().toEqualTypeOf<typeof funcWithUnknown>()
  // @ts-expect-error
  expectTypeOf(funcWithGenerics).toEqualTypeOf(funcWithUnknown)
})

interface BaseFunc {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (str: string): number
}

test('Distinguish between functions with readonly properties', () => {
  interface Original extends BaseFunc {
    readonly prop: string
  }

  interface Same extends BaseFunc {
    readonly prop: string
  }

  interface Different extends BaseFunc {
    prop: string
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one readonly otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between functions with optional properties', () => {
  interface Original extends BaseFunc {
    prop?: number
  }

  interface Same extends BaseFunc {
    prop?: number
  }

  interface Different extends BaseFunc {
    prop: number | undefined
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one optional otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between functions with properties of different types', () => {
  interface Original extends BaseFunc {
    prop: number
  }

  interface Same extends BaseFunc {
    prop: number
  }

  interface Different extends BaseFunc {
    prop: string
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one optional otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

interface BaseConstructor {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (str: string): {someProp: number}
}

test('Distinguish between constructors with readonly properties', () => {
  interface Original extends BaseConstructor {
    readonly prop: string
  }

  interface Same extends BaseConstructor {
    readonly prop: string
  }

  interface Different extends BaseConstructor {
    prop: string
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one readonly otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between constructors with optional properties', () => {
  interface Original extends BaseConstructor {
    prop?: number
  }

  interface Same extends BaseConstructor {
    prop?: number
  }

  interface Different extends BaseConstructor {
    prop: number | undefined
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one optional otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between constructors with properties of different types', () => {
  interface Original extends BaseConstructor {
    prop: number
  }

  interface Same extends BaseConstructor {
    prop: number
  }

  interface Different extends BaseConstructor {
    prop: string
  }

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // Only one optional otherwise same shape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between tuples with differing item type', () => {
  type Original = [{prop: number}]
  type Same = [{prop: number}]
  type Different = [{readonly prop: number}]

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // One item type property readonly otherwise same sape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between array with properties', () => {
  type Original = number[] & {readonly prop: number}
  type Same = number[] & {readonly prop: number}
  type Different = number[] & {prop: number}

  // Self-identity
  expectTypeOf<Original>().toEqualTypeOf<Original>()
  expectTypeOf<Different>().toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Original>()
  // @ts-expect-error
  expectTypeOf<Different>().not.toEqualTypeOf<Different>()

  // Same shape
  expectTypeOf<Original>().toEqualTypeOf<Same>()
  // @ts-expect-error
  expectTypeOf<Original>().not.toEqualTypeOf<Same>()

  // One item type property readonly otherwise same sape
  expectTypeOf<Original>().not.toEqualTypeOf<Different>()
  // @ts-expect-error
  expectTypeOf<Original>().toEqualTypeOf<Different>()
})

test('Distinguish between different types that are OR`d together', () => {
  expectTypeOf<{foo: number} | {bar: string}>().toEqualTypeOf<{foo: number} | {bar: string}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} | {bar: string}>().not.toEqualTypeOf<{foo: number} | {bar: string}>()

  expectTypeOf<{foo: number} | {bar: string}>().not.toEqualTypeOf<{foo: number}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} | {bar: string}>().toEqualTypeOf<{foo: number}>()
})

test('Distinguish between identical types that are OR`d together', () => {
  expectTypeOf<{foo: number} | {foo: number}>().toEqualTypeOf<{foo: number} | {foo: number}>()
  // Note: The `| T` in `Equal` in index.ts makes this work.
  expectTypeOf<{foo: number} | {foo: number}>().toEqualTypeOf<{foo: number}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} | {foo: number}>().not.toEqualTypeOf<{foo: number} | {foo: number}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} | {foo: number}>().not.toEqualTypeOf<{foo: number}>()
})

test('Distinguish between different types that are AND`d together', () => {
  // Identity
  expectTypeOf<{foo: number} & {bar: string}>().toEqualTypeOf<{foo: number} & {bar: string}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} & {bar: string}>().not.toEqualTypeOf<{foo: number} & {bar: string}>()

  // Two types intersect to an equivalent non-intersected type
  // This is broken at the moment. See the next test
  // expectTypeOf<{foo: number} & {bar: string}>().toEqualTypeOf<{foo: number; bar: string}>()
  // expectTypeOf<{foo: number} & {bar: string}>().not.toEqualTypeOf<{foo: number; bar: string}>()
})

test('Works arounds tsc bug not handling intersected types for this form of equivalence', () => {
  // @ts-expect-error This is the bug.
  expectTypeOf<{foo: number} & {bar: string}>().toEqualTypeOf<{foo: number; bar: string}>()
  // This should \@ts-expect-error but does not.
  expectTypeOf<{foo: number} & {bar: string}>().not.toEqualTypeOf<{foo: number; bar: string}>()

  const one: {foo: number} & {bar: string} = {foo: 1, bar: 'a'}
  const two: {foo: number; bar: string} = {foo: 1, bar: 'a'}
  // @ts-expect-error It also repros with variables and their inferred types
  expectTypeOf(one).toEqualTypeOf(two)
  // This should \@ts-expect-error but does not.
  expectTypeOf(one).not.toEqualTypeOf(two)

  // The workaround is the new optional .branded modifier.
  expectTypeOf<{foo: number} & {bar: string}>().branded.toEqualTypeOf<{foo: number; bar: string}>()
  expectTypeOf(one).branded.toEqualTypeOf<typeof two>()
  const tryUseBrandedDotNot = () =>
    // @ts-expect-error
    expectTypeOf<{foo: number} & {bar: string}>().branded.not.toEqualTypeOf<{foo: number; bar: string}>()

  expect(tryUseBrandedDotNot).toThrow()
  const tryUseBrandedDotNot2 = () =>
    // @ts-expect-error
    expectTypeOf(one).branded.not.toEqualTypeOf(two)

  expect(tryUseBrandedDotNot2).toThrow()
})

test(".branded doesn't get tripped up by overloaded functions", () => {
  type A = {
    f: {
      (_: 1): 1
      (_: 2): 2
    }
  }

  type B = {
    f: (_: 2) => 2
  }

  type C = {
    f: (_: 1 | 2) => 1 | 2
  }

  type D = {
    f: (...args: [1] | [2]) => 1 | 2
  }

  // @ts-expect-error
  expectTypeOf<A>().branded.toEqualTypeOf<B>()
  // @ts-expect-error
  expectTypeOf<A>().branded.toEqualTypeOf<C>()
  // @ts-expect-error
  expectTypeOf<A>().branded.toEqualTypeOf<D>()
  // @ts-expect-error
  expectTypeOf<B>().branded.toEqualTypeOf<C>()
})

test(".branded doesn't get tripped up by overloaded constructors", () => {
  class A {
    constructor(_: 1)
    constructor(_: 2)
    constructor(_: number) {}

    x = 1
  }
  class B {
    constructor(_: 2) {}

    x = 1
  }

  // todo[>=1.0.0]: change this to .branded.not instead of using a ts-expect-error
  // @ts-expect-error
  expectTypeOf(A).branded.toEqualTypeOf<typeof B>()

  expectTypeOf(A).not.toEqualTypeOf<typeof B>()
  expectTypeOf<A>().toEqualTypeOf<B>()
  expectTypeOf<A>().branded.toEqualTypeOf<B>()
})

test('Distinguish between identical types that are AND`d together', () => {
  expectTypeOf<{foo: number} & {foo: number}>().toEqualTypeOf<{foo: number} & {foo: number}>()
  // Note: The `& T` in `Equal` in index.ts makes this work.
  expectTypeOf<{foo: number} & {foo: number}>().toEqualTypeOf<{foo: number}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} & {foo: number}>().not.toEqualTypeOf<{foo: number} & {foo: number}>()
  // @ts-expect-error
  expectTypeOf<{foo: number} & {foo: number}>().not.toEqualTypeOf<{foo: number}>()

  expectTypeOf<{a: {b: 1} & {c: 1}}>().branded.toEqualTypeOf<{a: {b: 1; c: 1}}>()
  expectTypeOf<() => () => () => {a: 1} & {b: 1}>().not.toEqualTypeOf<() => () => () => {a: 1; c: 1}>()

  expectTypeOf<{foo: number} & {foo: number}>().toEqualTypeOf<{foo: number} & {foo: number}>()
  expectTypeOf<(() => 1) & {x: 1}>().not.toEqualTypeOf<() => 1>()
  expectTypeOf<(() => 1) & {x: 1}>().not.toEqualTypeOf<() => 1>()
})

test('.branded with tuples', () => {
  type A = {tuple: [1, unknown]}
  type B = {tuple: [1, any]}

  // @ts-expect-error any vs unknown inside tuple
  expectTypeOf<A>().branded.toEqualTypeOf<B>()
})

test('limitations', () => {
  // these *shouldn't* fail, but kept here to document missing behaviours. Once fixed, remove the expect-error comments to make sure they can't regress
  // @ts-expect-error TypeScript can't handle the truth: https://github.com/expect-type/issues/5 https://github.com/microsoft/TypeScript/issues/50670
  expectTypeOf<a.StrictEqualUsingBranding<() => () => () => void, () => () => () => string>>().toEqualTypeOf<false>()

  // @ts-expect-error toEqualTypeOf relies on TypeScript's internal `toBeIdentical` function which falls down with intersection types, but is otherwise accurate and performant: https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122
  expectTypeOf<{a: {b: 1} & {c: 1}}>().toEqualTypeOf<{a: {b: 1; c: 1}}>()
  // use `.branded` to get around this, at the cost of performance.
  expectTypeOf<{a: {b: 1} & {c: 1}}>().branded.toEqualTypeOf<{a: {b: 1; c: 1}}>()
})

test('PrintType', () => {
  expectTypeOf<a.PrintType<boolean>>().toEqualTypeOf<'boolean'>()
  expectTypeOf<a.PrintType<string>>().toEqualTypeOf<'string'>()
  expectTypeOf<a.PrintType<number>>().toEqualTypeOf<'number'>()
  expectTypeOf<a.PrintType<never>>().toEqualTypeOf<'never'>()
  expectTypeOf<a.PrintType<unknown>>().toEqualTypeOf<'unknown'>()
  expectTypeOf<a.PrintType<1>>().toEqualTypeOf<'literal number: 1'>()
  expectTypeOf<a.PrintType<'a'>>().toEqualTypeOf<'literal string: a'>()
  expectTypeOf<a.PrintType<true>>().toEqualTypeOf<'literal boolean: true'>()
  expectTypeOf<a.PrintType<false>>().toEqualTypeOf<'literal boolean: false'>()
  expectTypeOf<a.PrintType<null>>().toEqualTypeOf<'null'>()
  expectTypeOf<a.PrintType<undefined>>().toEqualTypeOf<'undefined'>()
  expectTypeOf<a.PrintType<() => {}>>().toEqualTypeOf<'function'>()
  expectTypeOf<a.PrintType<any>>().toBeNever()
})

test('Issue #53: `.omit()` should work similarly to `Omit`', () => {
  // https://github.com/mmkal/expect-type/issues/53

  type Loading = {
    state: 'loading'
  }

  type Failed = {
    state: 'failed'
    code: number
  }

  expectTypeOf<Omit<Loading | Failed, 'code'>>().toEqualTypeOf<{state: 'loading' | 'failed'}>()

  expectTypeOf<Loading | Failed>().omit<'code'>().toEqualTypeOf<{state: 'loading' | 'failed'}>()
})

test('Overload utils', () => {
  type O = {
    (): 0
    (a: 1): 1
    (a: 2): 2
  }

  expectTypeOf<OverloadParameters<O>>().toEqualTypeOf<[] | [1] | [2]>()
  expectTypeOf<OverloadReturnTypes<O>>().toEqualTypeOf<0 | 1 | 2>()

  type u = OverloadsInfoUnion<O>
  type o = UnionToIntersection<Exclude<u, (_: 2) => 2>>

  expectTypeOf<o>().toBeCallableWith()
  expectTypeOf<o>().toBeCallableWith(1)
  // @ts-expect-error
  expectTypeOf<o>().toBeCallableWith(2)

  type o2 = OverloadsNarrowedByParameters<O, []>

  expectTypeOf<o2>().toEqualTypeOf<() => 0>()
})

test('Overload edge cases', () => {
  type GenericFnType<T> = {
    (a: 1, t: T): T
    (b: 2, t: T): T
  }

  expectTypeOf<GenericFnType<number>>().parameters.not.toEqualTypeOf<[number, number]>()
  expectTypeOf<GenericFnType<number>>().parameters.toEqualTypeOf<[1, number] | [2, number]>()
  expectTypeOf<GenericFnType<number>>().returns.toEqualTypeOf<number>()

  type NoArgOverload = {
    (): 1
    (a: 1): 1
  }

  expectTypeOf<NoArgOverload>().parameters.toEqualTypeOf<[] | [1]>()
  expectTypeOf<NoArgOverload>().returns.toEqualTypeOf<1>()
})

test('prop notes', () => {
  type X = {
    aa: any
    bb: boolean
    aa1: number[]
    obj: {
      oa: any
      ob: boolean
    }
    aa2: Array<{x: number; y: any; z: never}>
    nn: never
    tt: [0, any, 2, never, 3]
    oo: {
      (a: any, b: any): any[]
      (b: unknown[]): never
    }
    ff: (this: any, x: 1) => 2
  }

  const notes: a.DeepBrandPropNotes<X, a.DeepBrandOptionsDefaults & {findType: 'any' | 'never'}> = {
    '.aa': 'any',
    '.obj.oa': 'any',
    '.aa2[number].y': 'any',
    '.aa2[number].z': 'never',
    '.nn': 'never',
    '.tt[number].1': 'any',
    '.tt[number].3': 'never',
    '.oo(overloads).0(params)[number].0': 'any',
    '.oo(overloads).0(params)[number].1': 'any',
    '.oo(overloads).0(return)[number]': 'any',
    '.oo(overloads).1(return)': 'never',
    '.ff(this)': 'any',
  }

  expectTypeOf(notes).toHaveProperty('.aa')
})

test('inspect', () => {
  expectTypeOf<{u: unknown}>().branded.inspect({foundProps: {}})
  // make sure if you do accidentally supply some, you're only allowed to supply an obvious error message
  expectTypeOf<{u: unknown}>().branded.inspect({foundProps: {'.u': 'No flagged props found!'}})

  expectTypeOf<{
    r: Record<string, any>
  }>().branded.inspect({
    // @ts-expect-error we should be forced to say that a record has any in its RHS
    foundProps: {
      // '.r(values)': 'any', // uncommenting this would remove the error
    },
  })

  expectTypeOf<{a: Record<string, unknown>}>().branded.toEqualTypeOf<{
    a: {[K in string]: unknown}
  }>()
})

test('toMatchObjectType', () => {
  expectTypeOf<{a: number}>().toMatchObjectType<{a: number}>()
  expectTypeOf<{a: number}>().not.toMatchObjectType<{a: string}>()
  expectTypeOf({a: 1, b: 2}).toMatchObjectType<{a: number}>()

  // @ts-expect-error
  expectTypeOf<any>().toMatchObjectType<number>()
  // @ts-expect-error
  expectTypeOf<{a: number}>().toMatchObjectType<{a: string} | {a: number}>()

  type MyType = {readonly a: string; b: number; c: {some: {very: {complex: 'type'}}}; d?: boolean}

  // @ts-expect-error
  expectTypeOf<MyType>().toMatchObjectType<{a: string; b: number}>() // fails - forgot readonly
  // @ts-expect-error
  expectTypeOf<MyType>().toMatchObjectType<{readonly a: string; b?: number}>() // fails - b shouldn't be optional
  // @ts-expect-error
  expectTypeOf<MyType>().toMatchObjectType<{readonly a: string; d: boolean}>() // fails - d should be optional

  expectTypeOf<MyType>().toMatchObjectType<{readonly a: string; b: number}>() // passes
  expectTypeOf<MyType>().toMatchObjectType<{readonly a: string; d?: boolean}>() // passes

  type BinaryOp = {
    (a: number, b: number): number
    (a: bigint, b: bigint): bigint
  }

  type Calculator = {add: BinaryOp; subtract: BinaryOp}

  expectTypeOf<Calculator>().toMatchObjectType<{add: BinaryOp}>()
  expectTypeOf<Calculator>().toMatchObjectType<{subtract: BinaryOp}>()
  expectTypeOf<Calculator>().toMatchObjectType<{add: BinaryOp; subtract: BinaryOp}>()

  expectTypeOf<Calculator>().toMatchObjectType<{
    add: {(a: number, b: number): number; (a: bigint, b: bigint): bigint}
  }>()

  // @ts-expect-error
  expectTypeOf<Calculator>().toMatchObjectType<{add: (a: number, b: number) => number}>() // fails - only one overload
  // @ts-expect-error
  expectTypeOf<Calculator>().toMatchObjectType<{add: (a: bigint, b: bigint) => bigint}>() // fails - only one overload

  // @ts-expect-error - missing optional property not allowed
  expectTypeOf<{a?: 1; b?: 2}>().toMatchObjectType<{a?: 1; b?: 2; c?: 3}>()

  // @ts-expect-error - c should be optional, not | undefined
  expectTypeOf<{a?: 1; b?: 2}>().toMatchObjectType<{a?: 1; b: 2 | undefined}>()

  // @ts-expect-error - type must match exactly, a union that includes the actual type isn't good enough
  expectTypeOf<{a: 1}>().toMatchObjectType<{a: 1 | undefined}>()
})
