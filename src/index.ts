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
  : string extends T
  ? 'string'
  : T extends string
  ? `literal string: ${T}`
  : number extends T
  ? 'number'
  : T extends number
  ? `literal number: ${T}`
  : T extends null
  ? 'null'
  : T extends undefined
  ? 'undefined'
  : T extends (...args: any[]) => any
  ? 'function'
  : '...'

/** Subjective "useful" keys from a type. For objects it's just `keyof` but for tuples/arrays it's the number keys
 * @example
 * UsefulKeys<{a: 1; b: 2}> // 'a' | 'b'
 * UsefulKeys<['a', 'b']> // '0' | '1'
 * UsefulKeys<string[]> // number
 */
export type UsefulKeys<T> = T extends any[]
  ? {
      [K in keyof T]: K
    }[number]
  : keyof T

// Helper for showing end-user a hint why their type assertion is failing.
// This swaps "leaf" types with a literal message about what the actual and expected types are.
// Needs to check for Not<IsAny<Actual>> because otherwise LeafTypeOf<Actual> returns never, which extends everything 🤔
export type MismatchInfo<Actual, Expected> = And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
  ? And<[Extends<any[], Actual>, Extends<any[], Expected>]> extends true
    ? Array<MismatchInfo<Extract<Actual, any[]>[number], Extract<Expected, any[]>[number]>>
    : {
        [K in UsefulKeys<Actual> | UsefulKeys<Expected>]: MismatchInfo<
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
 *
 * Note: not very performant for complex types - this should only be used when you know you need it. If doing
 * an equality check, it's almost always better to use `StrictEqualUsingTSInternalIdenticalToOperator`.
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

/** Returns true if `L extends R`. Explicitly checks for `never` since that can give unexpected results. */
export type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false
export type ExtendsUsingBranding<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>
export type ExtendsExcludingAnyOrNever<L, R> = IsAny<L> extends true ? IsAny<R> : Extends<L, R>

// much history: https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122
type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <
  T,
>() => T extends (R & T) | T ? true : false
  ? IsNever<L> extends IsNever<R>
    ? true
    : false
  : false

export type StrictEqualUsingBranding<Left, Right> = And<
  [ExtendsUsingBranding<Left, Right>, ExtendsUsingBranding<Right, Left>]
>

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

const mismatch = Symbol('mismatch')
type Mismatch = {[mismatch]: 'mismatch'}
/** A type which should match anything passed as a value but *doesn't* match `Mismatch` - helps TypeScript select the right overload for `toEqualTypeOf` and `toMatchTypeOf`. */
const avalue = Symbol('avalue')
type AValue = {[avalue]?: undefined} | string | number | boolean | symbol | bigint | null | undefined | void
type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<
  ActualResult,
  ExpectedResult
> extends true
  ? []
  : [Mismatch]

export interface ExpectTypeOfOptions {
  positive: boolean
  branded: boolean
}

const inverted = Symbol('inverted')
type Inverted<T> = {[inverted]: T}

const expectNull = Symbol('expectNull')
type ExpectNull<T> = {[expectNull]: T; result: ExtendsExcludingAnyOrNever<T, null>}
const expectUndefined = Symbol('expectUndefined')
type ExpectUndefined<T> = {[expectUndefined]: T; result: ExtendsExcludingAnyOrNever<T, undefined>}
const expectNumber = Symbol('expectNumber')
type ExpectNumber<T> = {[expectNumber]: T; result: ExtendsExcludingAnyOrNever<T, number>}
const expectString = Symbol('expectString')
type ExpectString<T> = {[expectString]: T; result: ExtendsExcludingAnyOrNever<T, string>}
const expectBoolean = Symbol('expectBoolean')
type ExpectBoolean<T> = {[expectBoolean]: T; result: ExtendsExcludingAnyOrNever<T, boolean>}
const expectVoid = Symbol('expectVoid')
type ExpectVoid<T> = {[expectVoid]: T; result: ExtendsExcludingAnyOrNever<T, void>}

const expectFunction = Symbol('expectFunction')
type ExpectFunction<T> = {[expectFunction]: T; result: ExtendsExcludingAnyOrNever<T, (...args: any[]) => any>}
const expectObject = Symbol('expectObject')
type ExpectObject<T> = {[expectObject]: T; result: ExtendsExcludingAnyOrNever<T, object>}
const expectArray = Symbol('expectArray')
type ExpectArray<T> = {[expectArray]: T; result: ExtendsExcludingAnyOrNever<T, any[]>}
const expectSymbol = Symbol('expectSymbol')
type ExpectSymbol<T> = {[expectSymbol]: T; result: ExtendsExcludingAnyOrNever<T, symbol>}

const expectAny = Symbol('expectAny')
type ExpectAny<T> = {[expectAny]: T; result: IsAny<T>}
const expectUnknown = Symbol('expectUnknown')
type ExpectUnknown<T> = {[expectUnknown]: T; result: IsUnknown<T>}
const expectNever = Symbol('expectNever')
type ExpectNever<T> = {[expectNever]: T; result: IsNever<T>}

const expectNullable = Symbol('expectNullable')
type ExpectNullable<T> = {[expectNullable]: T; result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>}

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
    /**
     * Uses typescript's internal technique to check for type "identicalness".
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode branded `.branded`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     */
    <
      Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
    ): true

    /**
     * Uses typescript's internal technique to check for type "identicalness".
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode branded `.branded`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     */
    <
      Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>
    ): true
  }

  toMatchTypeOf: {
    /**
     * A less strict version of {@linkcode toEqualTypeOf `.toEqualTypeOf`}
     * that allows for extra properties.
     * This is roughly equivalent to an `extends` constraint
     * in a function type argument.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     */
    <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true
    /**
     * A less strict version of {@linkcode toEqualTypeOf}
     * that allows for extra properties.
     * This is roughly equivalent to an `extends` constraint
     * in a function type argument.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     *
     */
    <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true
  }
  /**
   * Checks whether an object has a given property.
   *
   * @example
   * <caption>check that properties exist</caption>
   * ```ts
   * const obj = {a: 1, b: ''}
   *
   * expectTypeOf(obj).toHaveProperty('a')
   *
   * expectTypeOf(obj).not.toHaveProperty('c')
   * ```
   */
  toHaveProperty: <KeyType extends keyof Actual>(
    key: KeyType,
    ...MISMATCH: MismatchArgs<Extends<KeyType, keyof Actual>, true>
  ) => KeyType extends keyof Actual ? PositiveExpectTypeOf<Actual[KeyType]> : true

  /**
   * Inverts the result of the following assertions.
   *
   * @example
   * ```ts
   * expectTypeOf({ a: 1 }).not.toMatchTypeOf({ b: 1 })
   * ```
   */
  not: NegativeExpectTypeOf<Actual>

  /**
   * Intersection types can cause issues with {@linkcode toEqualTypeOf}:
   * ```ts
   * // ❌ The following line doesn't compile, even though the types are arguably the same.
   * expectTypeOf<{ a: 1 } & { b: 2 }>().toEqualTypeOf<{ a: 1; b: 2 }>()
   * ```
   * This helper works around this problem by using
   * a more permissive but less performant check.
   *
   * __Note__: This comes at a performance cost, and can cause the compiler
   * to 'give up' if used with excessively deep types, so use sparingly.
   *
   * @see {@link https://github.com/mmkal/expect-type/pull/21 Reference}
   */
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
    <Expected>(...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>): true
  }

  toMatchTypeOf: {
    <Expected>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>
    ): true
    <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>): true
  }

  toHaveProperty: <K extends string | number | symbol>(
    key: K,
    ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, false>
  ) => true
}

export type ExpectTypeOf<Actual, Options extends {positive: boolean}> = Options['positive'] extends true
  ? PositiveExpectTypeOf<Actual>
  : NegativeExpectTypeOf<Actual>

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

  /**
   * Checks whether a function is callable with the given parameters.
   *
   * @example
   * ```ts
   * const f = (a: number) => [a, a]
   *
   * expectTypeOf(f).toBeCallableWith(1)
   * ```
   *
   * __Note__: You cannot negate this assertion with
   * {@linkcode PositiveExpectTypeOf.not `.not`}, you need to use
   * `ts-expect-error` instead.
   *
   * __Known Limitation__: This assertion will likely fail if you try to use it
   * with a generic function or an overload.
   * @see {@link https://github.com/mmkal/expect-type/issues/50 This issue} for an example and a workaround.
   */
  toBeCallableWith: Options['positive'] extends true ? (...args: Params<Actual>) => true : never

  /**
   * Checks whether a class is constructible with the given parameters.
   *
   * @example
   * ```ts
   * expectTypeOf(Date).toBeConstructibleWith('1970')
   * expectTypeOf(Date).toBeConstructibleWith(0)
   * expectTypeOf(Date).toBeConstructibleWith(new Date())
   * expectTypeOf(Date).toBeConstructibleWith()
   *
   * expectTypeOf(Date).constructorParameters.toEqualTypeOf<[] | [string | number | Date]>()
   * ```
   */
  toBeConstructibleWith: Options['positive'] extends true ? (...args: ConstructorParams<Actual>) => true : never

  /**
   * Equivalent to the {@linkcode Extract} utility type.
   * Helps narrow down complex union types.
   *
   * @example
   * ```ts
   * type ResponsiveProp<T> = T | T[] | { xs?: T; sm?: T; md?: T }
   *
   * interface CSSProperties {
   *   margin?: string
   *   padding?: string
   * }
   *
   * function getResponsiveProp<T>(_props: T): ResponsiveProp<T> {
   *   return {}
   * }
   *
   * const cssProperties: CSSProperties = { margin: '1px', padding: '2px' }
   *
   * expectTypeOf(getResponsiveProp(cssProperties))
   *   .extract<{ xs?: any }>() // extracts the last type from a union
   *   .toEqualTypeOf<{ xs?: CSSProperties; sm?: CSSProperties; md?: CSSProperties }>()
   *
   * expectTypeOf(getResponsiveProp(cssProperties))
   *   .extract<unknown[]>() // extracts an array from a union
   *   .toEqualTypeOf<CSSProperties[]>()
   * ```
   *
   * __NOte__: If no type is found in the union, it will return `never`.
   */
  extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, Options>

  /**
   * Equivalent to the {@linkcode Exclude} utility type.
   * Removes types from a union.
   *
   * @example
   * ```ts
   * type ResponsiveProp<T> = T | T[] | { xs?: T; sm?: T; md?: T }
   *
   * interface CSSProperties {
   *   margin?: string
   *   padding?: string
   * }
   *
   * function getResponsiveProp<T>(_props: T): ResponsiveProp<T> {
   *   return {}
   * }
   *
   * const cssProperties: CSSProperties = { margin: '1px', padding: '2px' }
   *
   * expectTypeOf(getResponsiveProp(cssProperties))
   *   .exclude<unknown[]>()
   *   .exclude<{ xs?: unknown }>() // or just `.exclude<unknown[] | { xs?: unknown }>()`
   *   .toEqualTypeOf<CSSProperties>()
   * ```
   */
  exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, Options>

  /**
   * Equivalent to the {@linkcode Pick} utility type.
   * Helps select a subset of properties from an object type.
   *
   * @example
   * ```ts
   * interface Person {
   *   name: string
   *   age: number
   * }
   *
   * expectTypeOf<Person>()
   *   .pick<'name'>()
   *   .toEqualTypeOf<{ name: string }>()
   * ```
   */
  pick: <K extends keyof Actual>(v?: K) => ExpectTypeOf<Pick<Actual, K>, Options>

  /**
   * Equivalent to the {@linkcode Omit} utility type.
   * Helps remove a subset of properties from an object type.
   *
   * @example
   * ```ts
   * interface Person {
   *   name: string
   *   age: number
   * }
   *
   * expectTypeOf<Person>().omit<'name'>().toEqualTypeOf<{ age: number }>()
   * ```
   */
  omit: <K extends keyof Actual>(v?: K) => ExpectTypeOf<Omit<Actual, K>, Options>

  /**
   * Extracts a certain function argument with `.parameter(number)` call to
   * perform other assertions on it.
   *
   * @example
   * ```ts
   * function foo(a: number, b: string) {
   *   return [a, b]
   * }
   *
   * expectTypeOf(foo).parameter(0).toBeNumber()
   * expectTypeOf(foo).parameter(1).toBeString()
   * ```
   */
  parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], Options>

  /**
   *
   * Equivalent to the {@linkcode Parameters} utility type.
   * Extracts function parameters to perform assertions on its value.
   * Parameters are returned as an array.
   *
   * @example
   * ```ts
   * function noParam() {}
   * function hasParam(s: string) {}
   *
   * expectTypeOf(noParam).parameters.toEqualTypeOf<[]>()
   * expectTypeOf(hasParam).parameters.toEqualTypeOf<[string]>()
   * ```
   */
  parameters: ExpectTypeOf<Params<Actual>, Options>

  /**
   * Equivalent to the {@linkcode ConstructorParameters} utility type.
   * Extracts constructor parameters as an array of values and
   * perform assertions on them with this method.
   *
   * @example
   * ```ts
   * expectTypeOf(Date).constructorParameters.toEqualTypeOf<
   *   [] | [string | number | Date]
   * >()
   * ```
   */
  constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, Options>

  /**
   * Equivalent to the {@linkcode ThisParameterType} utility type.
   * Extracts the `this` parameter of a function to
   * perform assertions on its value.
   *
   * @example
   * ```ts
   * function greet(this: { name: string }, message: string) {
   *   return `Hello ${this.name}, here's your message: ${message}`
   * }
   *
   * expectTypeOf(greet).thisParameter.toEqualTypeOf<{ name: string }>()
   * ```
   */
  thisParameter: ExpectTypeOf<ThisParameterType<Actual>, Options>

  /**
   * Extracts the instance type of a class to perform assertions on.
   *
   * @example
   * ```ts
   * expectTypeOf(Date).instance.toHaveProperty('toISOString')
   * ```
   */
  instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, Options> : never

  /**
   * Equivalent to the {@linkcode ReturnType} utility type.
   * Extracts the return type of a function.
   *
   * @example
   * ```ts
   * expectTypeOf(() => {}).returns.toBeVoid()
   * expectTypeOf((a: number) => [a, a]).returns.toEqualTypeOf([1, 2])
   * ```
   */
  returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, Options> : never

  /**
   * Extracts resolved value of a Promise,
   * so you can perform other assertions on it.
   *
   * @example
   * ```ts
   * async function asyncFunc() {
   *   return 123
   * }
   *
   * expectTypeOf(asyncFunc).returns.resolves.toBeNumber()
   * expectTypeOf(Promise.resolve('string')).resolves.toBeString()
   * ```
   *
   * Type Equivalent:
   * ```ts
   * type Resolves<PromiseType> = PromiseType extends PromiseLike<infer ResolvedType>
   *   ? ResolvedType
   *   : never
   * ```
   */
  resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, Options> : never

  /**
   * Extracts array item type to perform assertions on.
   *
   * @example
   * ```ts
   * expectTypeOf([1, 2, 3]).items.toEqualTypeOf<number>()
   * expectTypeOf([1, 2, 3]).items.not.toEqualTypeOf<string>()
   * ```
   *
   * __Type Equivalent__:
   * ```ts
   * type Items<ArrayType> = ArrayType extends ArrayLike<infer ItemType>
   *   ? ItemType
   *   : never
   * ```
   */
  items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, Options> : never

  /**
   * Extracts the type guarded by a function to perform assertions on.
   *
   * @example
   * ```ts
   * function isString(v: any): v is string {
   *   return typeof v === 'string'
   * }
   *
   * expectTypeOf(isString).guards.toBeString()
   * ```
   */
  guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, Options> : never

  /**
   * Extracts the type asserted by a function to perform assertions on.
   *
   * @example
   * ```ts
   * function assertNumber(v: any): asserts v is number {
   *   if (typeof v !== 'number')
   *     throw new TypeError('Nope !')
   * }
   *
   * expectTypeOf(assertNumber).asserts.toBeNumber()
   * ```
   */
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
    pick: expectTypeOf,
    omit: expectTypeOf,
    toHaveProperty: expectTypeOf,
    parameter: expectTypeOf,
  }

  const getterProperties: readonly Keys[] = nonFunctionProperties
  getterProperties.forEach((prop: Keys) => Object.defineProperty(obj, prop, {get: () => expectTypeOf({})}))

  return obj as ExpectTypeOf<Actual, {positive: true; branded: false}>
}
