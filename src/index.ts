export type Not<T extends boolean> = T extends true ? false : true
export type Or<Types extends boolean[]> = Types[number] extends false ? false : true
export type And<Types extends boolean[]> = Types[number] extends true ? true : false
export type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>
export type Xor<Types extends [boolean, boolean]> = Not<Eq<Types[0], Types[1]>>

const secret = Symbol('secret')
type Secret = typeof secret

export type IsNever<T> = [T] extends [never] ? true : false
export type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false
export type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false
export type IsNeverOrAny<T> = Or<[IsNever<T>, IsAny<T>]>
export type BrandSpecial<T> = IsAny<T> extends true
  ? {special: true; type: 'any'}
  : IsUnknown<T> extends true
  ? {special: true; type: 'unknown'}
  : IsNever<T> extends true
  ? {special: true; type: 'never'}
  : never

export type PrintType<T> = IsUnknown<T> extends true
  ? 'unknown'
  : IsNever<T> extends true
  ? 'never'
  : IsAny<T> extends true
  ? never // special case, can't use `'any'` because that would match `any`
  : boolean extends T
  ? 'boolean'
  : T extends boolean
  ? `literal boolean: ${T}`
  : T extends string
  ? string extends T
    ? 'string'
    : `literal string: ${T}`
  : T extends number
  ? number extends T
    ? 'number'
    : `literal number: ${T}`
  : T extends null
  ? 'null'
  : T extends undefined
  ? 'undefined'
  : T extends (...args: any[]) => any
  ? 'function'
  : '...'

// Helper for showing end-user a hint why their type assertion is failing.
// This swaps "leaf" types with a literal message about what the actual and expected types are.
// Needs to check for Not<IsAny<Actual>> because otherwise LeafTypeOf<Actual> returns never, which extends everything 🤔
export type MismatchInfo<Actual, Expected> = And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
  ? {
      [K in keyof Actual | keyof Expected]: MismatchInfo<
        K extends keyof Actual ? Actual[K] : never,
        K extends keyof Expected ? Expected[K] : never
      >
    }
  : StrictEqualUsingBranding<Actual, Expected> extends true
  ? Actual
  : `Expected: ${PrintType<Expected>}, Actual: ${PrintType<Exclude<Actual, Expected>>}`

/**
 * Recursively walk a type and replace it with a branded type related to the original. This is useful for
 * equality-checking stricter than `A extends B ? B extends A ? true : false : false`, because it detects
 * the difference between a few edge-case types that vanilla typescript doesn't by default:
 * - `any` vs `unknown`
 * - `{ readonly a: string }` vs `{ a: string }`
 * - `{ a?: string }` vs `{ a: string | undefined }`
 */
export type DeepBrand<T> = IsNever<T> extends true
  ? {type: 'never'}
  : IsAny<T> extends true
  ? {type: 'any'}
  : IsUnknown<T> extends true
  ? {type: 'unknown'}
  : T extends string | number | boolean | symbol | bigint | null | undefined | void
  ? {
      type: 'primitive'
      value: T
    }
  : T extends new (...args: any[]) => any
  ? {
      type: 'constructor'
      params: ConstructorParams<T>
      instance: DeepBrand<InstanceType<Extract<T, new (...args: any) => any>>>
    }
  : T extends (...args: infer P) => infer R // avoid functions with different params/return values matching
  ? {
      type: 'function'
      params: DeepBrand<P>
      return: DeepBrand<R>
      this: DeepBrand<ThisParameterType<T>>
      props: DeepBrand<Omit<T, keyof Function>>
    }
  : T extends any[]
  ? {
      type: 'array'
      items: {[K in keyof T]: T[K]}
    }
  : {
      type: 'object'
      properties: {[K in keyof T]: DeepBrand<T[K]>}
      readonly: ReadonlyKeys<T>
      required: RequiredKeys<T>
      optional: OptionalKeys<T>
      constructorParams: DeepBrand<ConstructorParams<T>>
    }

export type RequiredKeys<T> = Extract<
  {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K
  }[keyof T],
  keyof T
>
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

// adapted from some answers to https://github.com/type-challenges/type-challenges/issues?q=label%3A5+label%3Aanswer
// prettier-ignore
export type ReadonlyKeys<T> = Extract<{
  [K in keyof T]-?: ReadonlyEquivalent<
    {[_K in K]: T[K]},
    {-readonly [_K in K]: T[K]}
  > extends true ? never : K;
}[keyof T], keyof T>;

// prettier-ignore
type ReadonlyEquivalent<X, Y> = Extends<
  (<T>() => T extends X ? true : false),
  (<T>() => T extends Y ? true : false)
>

export type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false
export type ExtendsUsingBranding<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>

// much history: https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122
type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <
  T,
>() => T extends (R & T) | T ? true : false
  ? IsNever<L> extends IsNever<R>
    ? true
    : false
  : false

export type StrictEqualUsingBranding<Left, Right> =
   And<[ExtendsUsingBranding<Left, Right>, ExtendsUsingBranding<Right, Left>]>

export type HopefullyPerformantEqual<Left, Right> = StrictEqualUsingTSInternalIdenticalToOperator<
  Left,
  Right
> extends true
  ? true
  : StrictEqualUsingBranding<Left, Right>

export type Params<Actual> = Actual extends (...args: infer P) => any ? P : never
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : never

const error = Symbol('error')
type Mismatch = {[error]: 'mismatch'}
type AValue = {[error]?: undefined}
type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<
  ActualResult,
  ExpectedResult
> extends true
  ? []
  : [Mismatch]

  type MismatchArgs2<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<
  ActualResult,
  ExpectedResult
> extends true
  ? []
  : [Mismatch, Mismatch]

export interface ExpectTypeOfOptions {
  positive: boolean
  branded: boolean
}

type Inverted<T> = {[error]: T}

type ExpectNull<T> = {[error]: T; result: Extends<T, null>}
type ExpectUndefined<T> = {[error]: T; result: Extends<T, undefined>}
type ExpectNumber<T> = {[error]: T; result: Extends<T, number>}
type ExpectString<T> = {[error]: T; result: Extends<T, string>}
type ExpectFunction<T> = {[error]: T; result: Extends<T, (...args: any[]) => any>}
type ExpectObject<T> = {[error]: T; result: Extends<T, object>}
type ExpectArray<T> = {[error]: T; result: Extends<T, any[]>}
type ExpectBoolean<T> = {[error]: T; result: Extends<T, boolean>}
type ExpectVoid<T> = {[error]: T; result: Extends<T, void>}
type ExpectSymbol<T> = {[error]: T; result: Extends<T, symbol>}
type ExpectAny<T> = {[error]: T; result: IsAny<T>}
type ExpectUnknown<T> = {[error]: T; result: IsUnknown<T>}
type ExpectNever<T> = {[error]: T; result: IsNever<T>}
type ExpectNullable<T> = {[error]: T; result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>}

type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
  ? Expecter
  : Inverted<Expecter>

export interface PositiveExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {positive: true; branded: false}> {
  toEqualTypeOf: {
    <
      Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
    ): true
    <
      Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
    ): true
  }

  toMatchTypeOf:{
    <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true
    <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true
  }

  not: NegativeExpectTypeOf<Actual>

  branded: {
    toEqualTypeOf: <
      Expected extends StrictEqualUsingBranding<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      ...MISMATCH: MismatchArgs<StrictEqualUsingBranding<Actual, Expected>, true>
    ) => true
  }
}

export interface NegativeExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {positive: false}> {
  toEqualTypeOf: {
    <Expected>(
      value: Expected & AValue,
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>
    ): true
    <Expected>(
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>
    ): true
  }

  toMatchTypeOf: {
    <Expected>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true
    <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>): true
  }

  branded: {
    toEqualTypeOf: <Expected>(
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>
    ) => true
  }
}

export type ExpectTypeOf<Actual, Options extends {positive: boolean}> = (Options['positive'] extends true
  ? PositiveExpectTypeOf<Actual>
  : NegativeExpectTypeOf<Actual>) 

export interface BaseExpectTypeOf<Actual, Options extends {positive: boolean}> {
  toBeAny: Scolder<ExpectAny<Actual>, Options>
  toBeUnknown: Scolder<ExpectUnknown<Actual>, Options>
  toBeNever: Scolder<ExpectNever<Actual>, Options>
  toBeFunction: Scolder<ExpectFunction<Actual>, Options>
  toBeObject: Scolder<ExpectObject<Actual>, Options>
  toBeArray: Scolder<ExpectArray<Actual>, Options>
  toBeNumber: Scolder<ExpectNumber<Actual>, Options>
  toBeString: Scolder<ExpectString<Actual>, Options>
  toBeBoolean: Scolder<ExpectBoolean<Actual>, Options>
  toBeVoid: Scolder<ExpectVoid<Actual>, Options>
  toBeSymbol: Scolder<ExpectSymbol<Actual>, Options>
  toBeNull: Scolder<ExpectNull<Actual>, Options>
  toBeUndefined: Scolder<ExpectUndefined<Actual>, Options>
  toBeNullable: Scolder<ExpectNullable<Actual>, Options>

  toBeCallableWith: Options['positive'] extends true ? (...args: Params<Actual>) => true : never
  toBeConstructibleWith: Options['positive'] extends true ? (...args: ConstructorParams<Actual>) => true : never
  toHaveProperty: <K extends string>(
    key: K,
    ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, Options['positive']>
  ) => K extends keyof Actual ? ExpectTypeOf<Actual[K], Options> : true
  extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, Options>
  exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, Options>
  parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], Options>
  parameters: ExpectTypeOf<Params<Actual>, Options>
  constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, Options>
  thisParameter: ExpectTypeOf<ThisParameterType<Actual>, Options>
  instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, Options> : never
  returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, Options> : never
  resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, Options> : never
  items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, Options> : never
  guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, Options> : never
  asserts: Actual extends (v: any, ...args: any[]) => asserts v is infer T
    ? // Guard methods `(v: any) => asserts v is T` does not actually defines a return type. Thus, any function taking 1 argument matches the signature before.
      // In case the inferred assertion type `R` could not be determined (so, `unknown`), consider the function as a non-guard, and return a `never` type.
      // See https://github.com/microsoft/TypeScript/issues/34636
      unknown extends T
      ? never
      : ExpectTypeOf<T, Options>
    : never
}
const fn: any = () => true

export type _ExpectTypeOf = {
  <Actual>(actual: Actual): ExpectTypeOf<Actual, {positive: true; branded: false}>
  <Actual>(): ExpectTypeOf<Actual, {positive: true; branded: false}>
}

/**
 * Similar to Jest's `expect`, but with type-awareness.
 * Gives you access to a number of type-matchers that let you make assertions about the
 * form of a reference or generic type parameter.
 *
 * @example
 * import {foo, bar} from '../foo'
 * import {expectTypeOf} from 'expect-type'
 *
 * test('foo types', () => {
 *   // make sure `foo` has type {a: number}
 *   expectTypeOf(foo).toMatchTypeOf({a: 1})
 *   expectTypeOf(foo).toHaveProperty('a').toBeNumber()
 *
 *   // make sure `bar` is a function taking a string:
 *   expectTypeOf(bar).parameter(0).toBeString()
 *   expectTypeOf(bar).returns.not.toBeAny()
 * })
 *
 * @description
 * See the [full docs](https://npmjs.com/package/expect-type#documentation) for lots more examples.
 */
export const expectTypeOf: _ExpectTypeOf = <Actual>(
  _actual?: Actual,
): ExpectTypeOf<Actual, {positive: true; branded: false}> => {
  const nonFunctionProperties = [
    'parameters',
    'returns',
    'resolves',
    'not',
    'items',
    'constructorParameters',
    'thisParameter',
    'instance',
    'guards',
    'asserts',
    'branded',
  ] as const
  type Keys = keyof PositiveExpectTypeOf<any> | keyof NegativeExpectTypeOf<any>

  type FunctionsDict = Record<Exclude<Keys, typeof nonFunctionProperties[number]>, any>
  const obj: FunctionsDict = {
    /* eslint-disable mmkal/@typescript-eslint/no-unsafe-assignment */
    toBeAny: fn,
    toBeUnknown: fn,
    toBeNever: fn,
    toBeFunction: fn,
    toBeObject: fn,
    toBeArray: fn,
    toBeString: fn,
    toBeNumber: fn,
    toBeBoolean: fn,
    toBeVoid: fn,
    toBeSymbol: fn,
    toBeNull: fn,
    toBeUndefined: fn,
    toBeNullable: fn,
    toMatchTypeOf: fn,
    toEqualTypeOf: fn,
    toBeCallableWith: fn,
    toBeConstructibleWith: fn,
    /* eslint-enable mmkal/@typescript-eslint/no-unsafe-assignment */
    extract: expectTypeOf,
    exclude: expectTypeOf,
    toHaveProperty: expectTypeOf,
    parameter: expectTypeOf,
  }

  const getterProperties: readonly Keys[] = nonFunctionProperties
  getterProperties.forEach((prop: Keys) => Object.defineProperty(obj, prop, {get: () => expectTypeOf({})}))

  return obj as ExpectTypeOf<Actual, {positive: true; branded: false}>
}
