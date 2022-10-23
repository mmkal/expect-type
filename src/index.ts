/* eslint-disable @typescript-eslint/no-unused-vars */
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
type DeepBrand<T> = IsAny<T> extends true // avoid `any` matching `unknown`
  ? Secret
  : T extends string | number | boolean | symbol | bigint | null | undefined
  ? T
  : T extends (...args: infer P) => infer R // avoid functions with different params/return values matching
  ? {
      type: 'function'
      params: DeepBrand<P>
      return: DeepBrand<R>
    }
  : {
      type: 'object'
      properties: {[K in keyof T]: DeepBrand<T[K]>}
      readonly: ReadonlyKeys<T>
      required: RequiredKeys<T>
      optional: OptionalKeys<T>
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
    { [_K in K]: T[K] },
    { -readonly [_K in K]: T[K] }
  > extends true ? never : K;
}[keyof T], keyof T>;

// prettier-ignore
type ReadonlyEquivalent<X, Y> = Extends<
  (<T>() => T extends X ? true : false),
  (<T>() => T extends Y ? true : false)
>

export type Extends<L, R> = L extends R ? true : false
export type StrictExtends<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>

export type Equal<Left, Right> = And<[StrictExtends<Left, Right>, StrictExtends<Right, Left>]>

export type Params<Actual> = Actual extends (...args: infer P) => any ? P : throw `can't get parameters from ${typeof Actual}, it's not a function`
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : throw `can't get constructor parameters from ${typeof Actual}, it's not constructible`

type MismatchArgs<B extends boolean, C extends boolean> = Eq<B, C> extends true ? [] : [never]

export interface Extendables {
  function: (...args: any[]) => any
  object: object
  array: any[]
  number: number
  string: string
  boolean: boolean
  symbol: symbol
  null: null
  undefined: undefined
}

export type FailureMessage<B extends boolean, Relationship extends string, Expected, Actual> =
  `expected type ${B extends true ? Relationship : `not ${Relationship}`} ${typeof Expected}, got ${typeof Actual}`

export type SimpleChecks<Actual, B extends boolean> = {
  any: IsAny<Actual>
  unknown: IsUnknown<Actual>
  never: IsNever<Actual>
  nullable: Not<Equal<Actual, NonNullable<Actual>>>
} & {
  [K in keyof Extendables]: Extends<Actual, Extendables[K]>
}

export type ExpectTypeOf_SimpleChecks<Actual, B extends boolean> = {
  [K in keyof SimpleChecks<Actual, B> as `toBe${capitalize K}`]: () => SimpleChecks<Actual, B>[K] extends B ? true : throw `expected ${B extends true ? K : `not ${K}`}, got ${typeof Actual}`
}

export interface ExpectTypeOf<Actual, B extends boolean> extends ExpectTypeOf_SimpleChecks<Actual, B> {
  toMatchTypeOf: {
    <Expected>(e: Expected) => Extends<Actual, Expected> extends B ? true : throw FailureMessage<B, 'extending', Expected, Actual>
    <Expected>() => Extends<Actual, Expected> extends B ? true : throw FailureMessage<B, 'extending', Expected, Actual>
  }
  toEqualTypeOf: {
    <Expected>(e: Expected) => Equal<Actual, Expected> extends B ? true : throw FailureMessage<B, 'equivalent to', Expected, Actual>
    <Expected>() => Equal<Actual, Expected> extends B ? true : throw FailureMessage<B, 'equivalent to', Expected, Actual>
  }
  toBeCallableWith: B extends true ? ((...args: Extract<Params<Actual>, any[]>) => true) : throw `don't use .not.toBeCallableWith. Use // @ts-expect-error. See https://github.com/mmkal/ts/issues/142`
  toBeConstructibleWith: B extends true ? (...args: Extract<ConstructorParams<Actual>, any[]>) => true : throw `don't use .not.toBeConstructibleWith. Use // @ts-expect-error. See https://github.com/mmkal/ts/issues/142`
  toHaveProperty: <K extends string>(key: K) => Extends<K, keyof Actual> extends B ? ExpectTypeOf<Actual[K & keyof Actual], B> : throw FailureMessage<B, 'to have property', keyof Actual, K>
  parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], B>
  parameters: ExpectTypeOf<Params<Actual>, B>
  constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, B>
  instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, B> : throw `${typeof Actual} is not constructible`
  returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, B> : throw `${typeof Actual} is not a function`
  resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, B> : throw `${typeof Actual} is not a promise`
  items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, B> : throw `${typeof Actual} is not an array`
  not: ExpectTypeOf<Actual, Not<B>>
}
const fn: any = () => true

export type _ExpectTypeOf = {
  <Actual>(actual: Actual): ExpectTypeOf<Actual, true>;
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
export const expectTypeOf: _ExpectTypeOf = <Actual>(actual?: Actual): ExpectTypeOf<Actual, true> => {
  const nonFunctionProperties = [
    'parameters',
    'returns',
    'resolves',
    'not',
    'items',
    'constructorParameters',
    'instance',
  ] as const
  type Keys = keyof ExpectTypeOf<any, any>

  type FunctionsDict = Record<Exclude<Keys, typeof nonFunctionProperties[number]>, any>
  const obj: FunctionsDict = {
    toBeAny: fn,
    toBeUnknown: fn,
    toBeNever: fn,
    toBeFunction: fn,
    toBeObject: fn,
    toBeArray: fn,
    toBeString: fn,
    toBeNumber: fn,
    toBeBoolean: fn,
    toBeSymbol: fn,
    toBeNull: fn,
    toBeUndefined: fn,
    toBeNullable: fn,
    toMatchTypeOf: fn,
    toEqualTypeOf: fn,
    toBeCallableWith: fn,
    toBeConstructibleWith: fn,
    toHaveProperty: expectTypeOf,
    parameter: expectTypeOf,
  }

  const getterProperties: readonly Keys[] = nonFunctionProperties
  getterProperties.forEach((prop: Keys) => Object.defineProperty(obj, prop, {get: () => expectTypeOf({})}))

  return obj as any
}