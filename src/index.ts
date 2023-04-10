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
  : T extends string
  ? string extends T
    ? 'string'
    : `literal string: ${T}`
  : T extends number
  ? number extends T
    ? 'number'
    : `literal number: ${T}`
  : T extends boolean
  ? boolean extends T
    ? 'boolean'
    : `literal boolean: ${T}`
  : T extends null
  ? 'null'
  : T extends undefined
  ? 'undefined'
  : T extends (...args: any[]) => any
  ? 'function'
  : T extends []
  ? '[]'
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
  : Equal<Actual, Expected> extends true
  ? Actual
  : `Expected: ${PrintType<Expected>}, Actual: ${PrintType<Actual>}`

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
export type StrictExtends<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>

export type Equal<Left, Right> = And<[StrictExtends<Left, Right>, StrictExtends<Right, Left>]>

export type Params<Actual> = Actual extends (...args: infer P) => any ? P : never
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : never

type MismatchArgs<B extends boolean, C extends boolean> = Eq<B, C> extends true ? [] : [never]

export interface ExpectTypeOf<Actual, B extends boolean> {
  toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true
  toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true
  toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true
  toBeFunction: (...MISMATCH: MismatchArgs<Extends<Actual, (...args: any[]) => any>, B>) => true
  toBeObject: (...MISMATCH: MismatchArgs<Extends<Actual, object>, B>) => true
  toBeArray: (...MISMATCH: MismatchArgs<Extends<Actual, any[]>, B>) => true
  toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true
  toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true
  toBeBoolean: (...MISMATCH: MismatchArgs<Extends<Actual, boolean>, B>) => true
  toBeVoid: (...MISMATCH: MismatchArgs<Extends<Actual, void>, B>) => true
  toBeSymbol: (...MISMATCH: MismatchArgs<Extends<Actual, symbol>, B>) => true
  toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true
  toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true
  toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true
  toExtend: <
    Expected extends B extends true
      ? Extends<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>
      : unknown,
  >(
    ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>
  ) => true
  toBeIdenticalTo: <
    Expected extends B extends true
      ? Equal<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>
      : unknown,
  >(
    ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
  ) => true

  toMatchTypeOf: {
    /**
     * @deprecated Use `toExtend` instead. Note that `toExtend` doesn't support passing a value, because supporting
     * them triggers typescript interence which makes error messages less helpful - if you need that, please raise
     * an issue on this library's github repo. This method may be removed or become an alias of `toExtend` in a future version.
     *
     * To switch, you can change:
     * @example
     * // before:
     * expectTypeOf(foo).toMatchTypeof<{x: number}>()
     * // after:
     * expectTypeOf(foo).toExtend<{x: number}>()
     *
     * // before:
     * expectTypeOf(foo).toMatchTypeof({x: 1})
     * // after:
     * expectTypeOf(foo).toExtend<{x: number}>()
     * // or:
     * const expected = {x: 1}
     * expectTypeOf(foo).toExtend<typeof expected>()
     */
    <
      Expected extends B extends true
        ? Extends<Actual, Expected> extends true
          ? unknown
          : MismatchInfo<Actual, Expected>
        : unknown,
    >(
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>
    ): true
    <
      Expected extends B extends true
        ? Extends<Actual, Expected> extends true
          ? unknown
          : MismatchInfo<Actual, Expected>
        : unknown,
    >(
      expected: Expected,
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>
    ): true
  }
  toEqualTypeOf: {
    /**
     * @deprecated Use `toBeIdenticalTo` instead. Note that `toBeIdenticalTo` doesn't support passing a value, because supporting
     * them triggers typescript interence which makes error messages less helpful - if you need that, please raise
     * an issue on this library's github repo. This method may be removed or become an alias to `toBeIdenticalTo` in a future version.
     *
     * To switch, you can change:
     * @example
     * // before:
     * expectTypeOf(foo).toEqualTypeOf<{x: number}>()
     * // after:
     * expectTypeOf(foo).toBeIdenticalTo<{x: number}>()
     *
     * // before:
     * expectTypeOf(foo).toEqualTypeOf({x: 1})
     * // after:
     * expectTypeOf(foo).toBeIdenticalTo<{x: number}>()
     * // or:
     * const expected = {x: 1}
     * expectTypeOf(foo).toBeIdenticalTo<typeof expected>()
     */
    <
      Expected extends B extends true
        ? Equal<Actual, Expected> extends true
          ? unknown
          : MismatchInfo<Actual, Expected>
        : unknown,
    >(
      ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
    ): true
    <
      Expected extends B extends true
        ? Equal<Actual, Expected> extends true
          ? unknown
          : MismatchInfo<Actual, Expected>
        : unknown,
    >(
      expected: Expected,
      ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>
    ): true
  }
  toBeCallableWith: B extends true ? (...args: Params<Actual>) => true : never
  toBeConstructibleWith: B extends true ? (...args: ConstructorParams<Actual>) => true : never
  toHaveProperty: <K extends string>(
    key: K,
    ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>
  ) => K extends keyof Actual ? ExpectTypeOf<Actual[K], B> : true
  extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, B>
  exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, B>
  parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], B>
  parameters: ExpectTypeOf<Params<Actual>, B>
  constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, B>
  thisParameter: ExpectTypeOf<ThisParameterType<Actual>, B>
  instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, B> : never
  returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, B> : never
  resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, B> : never
  items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, B> : never
  guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, B> : never
  asserts: Actual extends (v: any, ...args: any[]) => asserts v is infer T
    ? // Guard methods `(v: any) => asserts v is T` does not actually defines a return type. Thus, any function taking 1 argument matches the signature before.
      // In case the inferred assertion type `R` could not be determined (so, `unknown`), consider the function as a non-guard, and return a `never` type.
      // See https://github.com/microsoft/TypeScript/issues/34636
      unknown extends T
      ? never
      : ExpectTypeOf<T, B>
    : never
  not: ExpectTypeOf<Actual, Not<B>>
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
    'thisParameter',
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
    toExtend: fn,
    toBeIdenticalTo: fn,
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

type RealUnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
type UnionToIntersection<T> = T // (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type TypeRecordInner<T, Record = {}, Path extends string = ''> = Or<[IsAny<T>, IsUnknown<T>, IsNever<T>]> extends true
  ? Record & {[K in Path]: IsAny<T> extends true ? 'any' : PrintType<T>}
  : T extends string | number | boolean | null | undefined | readonly []
  ? Record & {[K in Path]: PrintType<T>}
  : T extends [any, ...any[]] // 0-length tuples handled above, 1-or-more element tuples handled separately from arrays
  ? UnionToIntersection<
      {
        [K in keyof T]: TypeRecordInner<T[K], Record, `${Path}[${Extract<K, Digit>}]`>
      }[Extract<keyof T, Digit> | number]
    >
  : T extends readonly [any, ...any[]] // 0-length tuples handled above, 1-or-more element tuples handled separately from arrays
  ? UnionToIntersection<
      {
        [K in keyof T]: TypeRecordInner<T[K], Record, `${Path}[${Extract<K, Digit>}](readonly)`>
      }[Extract<keyof T, Digit> | number]
    >
  : T extends Array<infer X>
  ? TypeRecordInner<X, Record, `${Path}[]`>
  : T extends (...args: infer Args) => infer Return
  ? TypeRecordInner<Args, Record, `${Path}:args`> &
      TypeRecordInner<Return, Record, `${Path}:return`> &
      TypeRecordInner<Omit<T, keyof Function>, Record, Path> // pick up properties of "augmented" functions e.g. the `foo` of `Object.assign(() => 1, {foo: 'bar'})`
  : // prettier-ignore
  NonNullable<{[K in keyof T]-?: TypeRecordInner<NonNullable<T>[K], Record, `${Path}.${Extract<K, string | number>}${K extends ReadonlyKeys<T> ? '(readonly)' : ''}${K extends OptionalKeys<T> ? '?' : ''}`>}> extends infer X ? {x: X; kx: keyof X; xkx: X[keyof X]} : never // RUTI<NonNullable<{[K in keyof T]: TypeRecordInner<T[K], Record, `${Path}.${Extract<K, string | number>}${K extends ReadonlyKeys<T>  ? '(readonly)' : ''}${K extends OptionalKeys<T> ? '?' : ''}`>}> >

type t2 = TypeRecord<{a?: {b: 1}}>

// UnionToIntersection< {[K in keyof T]: 111}[keyof T]>
type x = 1 extends 1
  ? 1
  : UnionToIntersection<
      {
        [K in keyof T]: TypeRecordInner<
          T[K],
          Record,
          `${Path}.${Extract<K, string | number>}${K extends ReadonlyKeys<T>
            ? '(readonly)'
            : ''}${K extends OptionalKeys<T> ? '?' : ''}`
        >
      }[keyof T]
    >

type obj = {
  deeply: {
    nested: {
      optional?: 1
      readonly readonly: 1
      readonly optionalreadonly?: 1
      optionalobj?: {a: 1}
      orundefined: 1 | undefined
      ornull: 1 | null
      empty: []
      one: ['a']
      const: readonly [1]
      two: ['a', 'b']
      arr: string[]
      value: number
      str: string
      fn: (x: 1) => number
      fn2: () => number
      augmented: ((x: 1, y: 2) => number) & {abc: 123}
      null: null
      undefined: undefined
      any: any
      never: never
      unknown: unknown
      partialish: {a?: 1; b: 2}
    }
    other: {
      val: 1
    }
  }
}

type TypeRecord<T> = {
  [K in keyof TypeRecordInner<T>]: TypeRecordInner<T>[K]
}

type tt = TypeRecord<obj>
type t3 = TypeRecord<'a' | undefined>

type u = {
  a?:
    | {
        '.a?': 'undefined'
      }
    | {
        '.a?': 'literal number: 1'
      }
    | undefined
  b?:
    | {
        '.b?': 'undefined'
      }
    | {
        '.b?': 'literal number: 1'
      }
    | undefined
}
type MergyThingKeys<T> = NonNullable<
  {
    [K in keyof NonNullable<T>]: NonNullable<K>
  }[keyof NonNullable<T>]
>

type u2 = NonNullable<u[keyof u]>
type k = keyof u
type x = NonNullable<
  {
    [K in keyof u]: NonNullable<K>
  }[keyof u]
>
type x2 = MergyThingKeys<u>
type x3 = RealUnionToIntersection<
  {
    [K in MergyThingKeys<u>]: {
      [J in keyof NonNullable<u[K]>]: NonNullable<u[K]>[J]
    }
  }[MergyThingKeys<u>]
>

type RUTI<U> = RealUnionToIntersection<
  {
    [K in MergyThingKeys<U>]: {
      [J in keyof NonNullable<U[K]>]: NonNullable<U[K]>[J]
    }
  }[MergyThingKeys<U>]
>
type v = NonNullable<u['a']>['.a?']
