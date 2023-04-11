/* eslint-disable mmkal/@typescript-eslint/ban-ts-comment */
import * as a from '../src'

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

  expectTypeOf<a.Equal<1, 1>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<1, number>>().toEqualTypeOf<false>()
  expectTypeOf<a.Equal<{a: 1}, {a: 1}>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<[{a: 1}], [{a: 1}]>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<never, never>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<any, any>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<unknown, unknown>>().toEqualTypeOf<true>()
  expectTypeOf<a.Equal<any, never>>().toEqualTypeOf<false>()
  expectTypeOf<a.Equal<any, unknown>>().toEqualTypeOf<false>()
  expectTypeOf<a.Equal<never, unknown>>().toEqualTypeOf<false>()
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

test('intersections work properly', () => {
  expectTypeOf<{a: 1} & {b: 2}>().toEqualTypeOf<{a: 1; b: 2}>()
  expectTypeOf<{a: 1} & {b: 2}>().toMatchTypeOf<{a: 1; b: 2}>()
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

  // broken built-in behaviour:
  expectTypeOf<ConstructorParameters<typeof Date>>().toEqualTypeOf<[string | number | Date]>()
  expectTypeOf<typeof Date extends new (...args: infer Args) => any ? Args : never>().toEqualTypeOf<
    [string | number | Date]
  >()

  // workaround:
  expectTypeOf<a.ConstructorParams<typeof Date>>().toEqualTypeOf<[] | [string | number | Date]>()
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
  /* eslint-disable mmkal/@typescript-eslint/no-redundant-type-constituents */

  /** shim conditional-type-check's `assert` */
  const assert = <T extends boolean>(_result: T) => true
  /** shim conditional-type-check's `IsExact` using `Equal` */
  type IsExact<T, U> = a.Equal<T, U>

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
  expectTypeOf<a.Equal<() => void, () => string>>().toEqualTypeOf<false>()
  expectTypeOf<a.Equal<() => void, (s: string) => void>>().toEqualTypeOf<false>()
  expectTypeOf<a.Equal<() => () => () => void, () => (s: string) => () => void>>().toEqualTypeOf<false>()
})

test(`undefined isn't removed from unions`, () => {
  expectTypeOf<string | null | undefined>().toEqualTypeOf('' as string | null | undefined)
  expectTypeOf<string | null | undefined>().toMatchTypeOf('' as string | null | undefined)

  expectTypeOf('' as string | null | undefined).toEqualTypeOf<string | null | undefined>()
  expectTypeOf('' as string | null | undefined).toMatchTypeOf<string | null | undefined>()

  expectTypeOf<string | null | undefined>().toEqualTypeOf<string | null | undefined>()
  expectTypeOf<string | null | undefined>().toMatchTypeOf<string | null | undefined>()
})

test('limitations', () => {
  // these *shouldn't* fail, but kept here to document missing behaviours. Once fixed, remove the expect-error comments to make sure they can't regress
  expectTypeOf<a.Equal<() => () => () => void, () => () => () => string>>().toEqualTypeOf<false>()

  expectTypeOf<(() => 1) & {x: 1}>().not.toEqualTypeOf<() => 1>()
})
