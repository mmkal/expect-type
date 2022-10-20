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

export type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : L extends R ? true : false
export type StrictExtends<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>

export type Equal<Left, Right> = And<[StrictExtends<Left, Right>, StrictExtends<Right, Left>]>

export type Params<Actual> = Actual extends (...args: infer P) => any ? P : never
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : never

type MismatchArgs<Result extends boolean, ExpectedResult extends boolean, Actual, Expected> =
  Eq<Result, ExpectedResult> extends true ? [] : [{
    actual: Actual,
    expected: ExpectedResult extends false ? {not: Expected} : Expected
  }]

export interface ExpectTypeOf<Actual, ExpectedResult extends boolean> {
  toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, ExpectedResult, Actual, {equals: any}>) => true
  toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, ExpectedResult, Actual, {equals: unknown}>) => true
  toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, ExpectedResult, Actual, {equals: never}>) => true
  toBeFunction: (...MISMATCH: MismatchArgs<Extends<Actual, (...args: any[]) => any>, ExpectedResult, Actual, {extends: (...args: any[]) => any}>) => true
  toBeObject: (...MISMATCH: MismatchArgs<Extends<Actual, object>, ExpectedResult, Actual, {extends: object}>) => true
  toBeArray: (...MISMATCH: MismatchArgs<Extends<Actual, any[]>, ExpectedResult, Actual, {extends: any[]}>) => true
  toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, ExpectedResult, Actual, {extends: number}>) => true
  toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, ExpectedResult, Actual, {extends: string}>) => true
  toBeBoolean: (...MISMATCH: MismatchArgs<Extends<Actual, boolean>, ExpectedResult, Actual, {extends: boolean}>) => true
  toBeVoid: (...MISMATCH: MismatchArgs<Extends<Actual, void>, ExpectedResult, Actual, {equals: void}>) => true
  toBeSymbol: (...MISMATCH: MismatchArgs<Extends<Actual, symbol>, ExpectedResult, Actual, {extends: symbol}>) => true
  toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, ExpectedResult, Actual, {equals: null}>) => true
  toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, ExpectedResult, Actual, {equals: undefined}>) => true
  toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, ExpectedResult, Actual, 'to be nullable'>) => true
  toMatchTypeOf: {
    <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, ExpectedResult, Actual, {extends: Expected}>): true
    <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, ExpectedResult, Actual, {extends: Expected}>): true
  }
  toEqualTypeOf: {
    <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected>, ExpectedResult, Actual, {equals: Expected}>): true
    <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, ExpectedResult, Actual, {equals: Expected}>): true
  }
  toBeCallableWith: ExpectedResult extends true ? (...args: Params<Actual>) => true : never
  toBeConstructibleWith: ExpectedResult extends true ? (...args: ConstructorParams<Actual>) => true : never
  toHaveProperty: <K extends string>(
    key: K,
    ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, ExpectedResult, Actual, {hasProperty: K}>
  ) => K extends keyof Actual ? ExpectTypeOf<Actual[K], ExpectedResult> : true
  extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, ExpectedResult>
  exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, ExpectedResult>
  parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], ExpectedResult>
  parameters: ExpectTypeOf<Params<Actual>, ExpectedResult>
  constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, ExpectedResult>
  instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, ExpectedResult> : never
  returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, ExpectedResult> : never
  resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, ExpectedResult> : never
  items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, ExpectedResult> : never
  guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, ExpectedResult> : never
  asserts: Actual extends (v: any, ...args: any[]) => asserts v is infer T
    ? // Guard methods `(v: any) => asserts v is T` does not actually defines a return type. Thus, any function taking 1 argument matches the signature before.
      // In case the inferred assertion type `R` could not be determined (so, `unknown`), consider the function as a non-guard, and return a `never` type.
      // See https://github.com/microsoft/TypeScript/issues/34636
      unknown extends T
      ? never
      : ExpectTypeOf<T, ExpectedResult>
    : never
  not: ExpectTypeOf<Actual, Not<ExpectedResult>>
}
const fn: any = () => true

export type _ExpectTypeOf = {
  <Actual>(actual: Actual): ExpectTypeOf<Actual, true>
  <Actual>(): ExpectTypeOf<Actual, true>
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
export const expectTypeOf: _ExpectTypeOf = <Actual>(_actual?: Actual): ExpectTypeOf<Actual, true> => {
  const nonFunctionProperties = [
    'parameters',
    'returns',
    'resolves',
    'not',
    'items',
    'constructorParameters',
    'instance',
    'guards',
    'asserts',
  ] as const
  type Keys = keyof ExpectTypeOf<any, any>

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

  return obj as ExpectTypeOf<Actual, true>
}
