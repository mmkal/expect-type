/**
 * Negates a boolean type.
 */
export type Not<T extends boolean> = T extends true ? false : true

/**
 * Returns `true` if at least one of the types in the
 * {@linkcode Types} array is `true`, otherwise returns `false`.
 */
export type Or<Types extends boolean[]> = Types[number] extends false ? false : true

/**
 * Checks if all the boolean types in the {@linkcode Types} array are `true`.
 */
export type And<Types extends boolean[]> = Types[number] extends true ? true : false

/**
 * Represents an equality type that returns {@linkcode Right} if
 * {@linkcode Left} is `true`,
 * otherwise returns the negation of {@linkcode Right}.
 */
export type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>

/**
 * Represents the exclusive OR operation on a tuple of boolean types.
 * Returns `true` if exactly one of the boolean types is `true`,
 * otherwise returns `false`.
 */
export type Xor<Types extends [boolean, boolean]> = Not<Eq<Types[0], Types[1]>>

/**
 * A symbol representing a secret value.
 */
const secret = Symbol('secret')
/**
 * Represents the type of the {@linkcode secret} variable.
 */
type Secret = typeof secret

/**
 * Checks if the given type is `never`.
 *
 */
export type IsNever<T> = [T] extends [never] ? true : false
/**
 * Checks if the given type is `any`.
 */
export type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false
/**
 * Determines if the given type is `unknown`.
 */
export type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false
/**
 * Determines if a type is either `never` or `any`.
 */
export type IsNeverOrAny<T> = Or<[IsNever<T>, IsAny<T>]>

/**
 * Determines the printable type representation for a given type.
 */
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

/**
 * Subjective "useful" keys from a type. For objects it's just `keyof` but for
 * tuples/arrays it's the number keys.
 *
 * @example
 * ```ts
 * UsefulKeys<{a: 1; b: 2}> // 'a' | 'b'
 *
 * UsefulKeys<['a', 'b']> // '0' | '1'
 *
 * UsefulKeys<string[]> // number
 * ```
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
 * Represents a deeply branded type.
 *
 * Recursively walk a type and replace it with a branded type related to the
 * original. This is useful for equality-checking stricter than
 * `A extends B ? B extends A ? true : false : false`, because it detects the
 * difference between a few edge-case types that vanilla typescript
 * doesn't by default:
 * - `any` vs `unknown`
 * - `{ readonly a: string }` vs `{ a: string }`
 * - `{ a?: string }` vs `{ a: string | undefined }`
 *
 * __Note__: not very performant for complex types - this should only be used
 * when you know you need it. If doing an equality check, it's almost always
 * better to use {@linkcode StrictEqualUsingTSInternalIdenticalToOperator}.
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

/**
 * Extracts the keys from a type that are required (not optional).
 */
export type RequiredKeys<T> = Extract<
  {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K
  }[keyof T],
  keyof T
>
/**
 * Gets the keys of an object type that are optional.
 */
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

// adapted from some answers to https://github.com/type-challenges/type-challenges/issues?q=label%3A5+label%3Aanswer
// prettier-ignore
/**
 * Extracts the keys from a type that are not readonly.
 */
export type ReadonlyKeys<T> = Extract<{
  [K in keyof T]-?: ReadonlyEquivalent<
    {[_K in K]: T[K]},
    {-readonly [_K in K]: T[K]}
  > extends true ? never : K;
}[keyof T], keyof T>;

// prettier-ignore
/**
 * Determines if two types, are equivalent in a `readonly` manner.
 */
type ReadonlyEquivalent<X, Y> = Extends<
  (<T>() => T extends X ? true : false),
  (<T>() => T extends Y ? true : false)
>

/**
 * Checks if one type extends another.
 */
export type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false
export type ExtendsUsingBranding<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>
export type ExtendsExcludingAnyOrNever<L, R> = IsAny<L> extends true ? IsAny<R> : Extends<L, R>

/**
 * Checks if two types are strictly equal using
 * the TypeScript internal identical-to operator.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122 much history}
 */
type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <
  T,
>() => T extends (R & T) | T ? true : false
  ? IsNever<L> extends IsNever<R>
    ? true
    : false
  : false

/**
 * Checks if two types are strictly equal using branding.
 */
export type StrictEqualUsingBranding<Left, Right> = And<
  [ExtendsUsingBranding<Left, Right>, ExtendsUsingBranding<Right, Left>]
>

/**
 * Represents a type that checks if two types are equal, using
 * a hopefully performant approach.
 * It first checks if the types are strictly equal using
 * {@linkcode StrictEqualUsingTSInternalIdenticalToOperator}.
 * If they are not strictly equal, it falls back to using the
 * {@linkcode StrictEqualUsingBranding} type.
 */
export type HopefullyPerformantEqual<Left, Right> = StrictEqualUsingTSInternalIdenticalToOperator<
  Left,
  Right
> extends true
  ? true
  : StrictEqualUsingBranding<Left, Right>

/**
 * Extracts the parameter types from a function type.
 */
export type Params<Actual> = Actual extends (...args: infer ParameterTypes) => any ? ParameterTypes : never
/**
 * Represents the constructor parameters of a class or constructor function.
 * If the constructor takes no arguments, an empty array is returned.
 */
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : never

/**
 * A symbol representing a mismatch.
 */
const mismatch = Symbol('mismatch')
/**
 * Represents a mismatch between expected and actual values.
 */
type Mismatch = {[mismatch]: 'mismatch'}

/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf `.toEqualTypeOf()`} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf `.toMatchTypeOf()`}.
 */
const avalue = Symbol('avalue')
/**
 * Represents a value that can be of various types.
 */
type AValue = {[avalue]?: undefined} | string | number | boolean | symbol | bigint | null | undefined | void

/**
 * Represents the type of mismatched arguments between
 * the actual result and the expected result.
 *
 * If {@linkcode ActualResult} and {@linkcode ExpectedResult} are equivalent,
 * the type resolves to an empty tuple `[]`, indicating no mismatch.
 * If they are not equivalent, it resolves to a tuple containing the element
 * {@linkcode Mismatch}, signifying a discrepancy between
 * the expected and actual results.
 */
type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<
  ActualResult,
  ExpectedResult
> extends true
  ? []
  : [Mismatch]

/**
 * Represents the options for the {@linkcode ExpectTypeOf} function.
 */
export interface ExpectTypeOfOptions {
  positive: boolean
  branded: boolean
}

/**
 * A `symbol` representing the inverted state.
 */
const inverted = Symbol('inverted')
/**
 * Represents a type that maps values to their inverted form.
 */
type Inverted<T> = {[inverted]: T}

/**
 * A `symbol` representing the expectation of a `null` value.
 */
const expectNull = Symbol('expectNull')
/**
 * Represents a type that expects a value to be `null`.
 */
type ExpectNull<T> = {[expectNull]: T; result: ExtendsExcludingAnyOrNever<T, null>}

/**
 * `Symbol` representing the expectation of an `undefined` value.
 */
const expectUndefined = Symbol('expectUndefined')
/**
 * Represents a type that expects a value to be `undefined`.
 */
type ExpectUndefined<T> = {[expectUndefined]: T; result: ExtendsExcludingAnyOrNever<T, undefined>}

/**
 * Symbol representing the expectation of a `number`.
 */
const expectNumber = Symbol('expectNumber')
/**
 * Represents a type that expects a `number`.
 */
type ExpectNumber<T> = {[expectNumber]: T; result: ExtendsExcludingAnyOrNever<T, number>}

/**
 * `Symbol` representing the expectation of a `string`.
 */
const expectString = Symbol('expectString')
/**
 * Represents a type that expects a `string` value.
 */
type ExpectString<T> = {[expectString]: T; result: ExtendsExcludingAnyOrNever<T, string>}

/**
 * Symbol used for expecting a `boolean` value.
 */
const expectBoolean = Symbol('expectBoolean')
/**
 * Represents an expectation for a `boolean` type.
 */
type ExpectBoolean<T> = {[expectBoolean]: T; result: ExtendsExcludingAnyOrNever<T, boolean>}

/**
 * `Symbol` representing the expectation of a void value.
 */
const expectVoid = Symbol('expectVoid')
/**
 * Represents a type that expects a `void` value.
 */
type ExpectVoid<T> = {[expectVoid]: T; result: ExtendsExcludingAnyOrNever<T, void>}

/**
 * `Symbol` representing the expect function.
 */
const expectFunction = Symbol('expectFunction')
/**
 * Represents an expectation function.
 */
type ExpectFunction<T> = {[expectFunction]: T; result: ExtendsExcludingAnyOrNever<T, (...args: any[]) => any>}

/**
 * `Symbol` representing the expectation of an object.
 */
const expectObject = Symbol('expectObject')
/**
 * Represents an expectation object that includes a value of type {@linkcode T}
 * and a result indicating if {@linkcode T} extends any object type excluding
 * `any` or `never`.
 */
type ExpectObject<T> = {[expectObject]: T; result: ExtendsExcludingAnyOrNever<T, object>}

/**
 * `Symbol` representing an expectation for an array.
 */
const expectArray = Symbol('expectArray')
/**
 * Represents an expectation of an array type.
 */
type ExpectArray<T> = {[expectArray]: T; result: ExtendsExcludingAnyOrNever<T, any[]>}

/**
 * A `symbol` used for expectation handling.
 */
const expectSymbol = Symbol('expectSymbol')
/**
 * Represents a type that expects a `symbol`.
 */
type ExpectSymbol<T> = {[expectSymbol]: T; result: ExtendsExcludingAnyOrNever<T, symbol>}

/**
 * A `symbol` representing an expectation of any type.
 */
const expectAny = Symbol('expectAny')
/**
 * Represents a type that expects `any` value.
 */
type ExpectAny<T> = {[expectAny]: T; result: IsAny<T>}

/**
 * Symbol representing an `unknown` expectation.
 */
const expectUnknown = Symbol('expectUnknown')
/**
 * Represents a type that expects an `unknown` value.
 */
type ExpectUnknown<T> = {[expectUnknown]: T; result: IsUnknown<T>}

/**
 * A `symbol` representing an expectation of never reaching a certain code path.
 */
const expectNever = Symbol('expectNever')
/**
 * Represents a type that checks if the provided type {@linkcode T} is `never`.
 */
type ExpectNever<T> = {[expectNever]: T; result: IsNever<T>}

/**
 * `Symbol` used to indicate that a value is expected to be nullable.
 */
const expectNullable = Symbol('expectNullable')
/**
 * Represents a type that expects a nullable value.
 */
type ExpectNullable<T> = {[expectNullable]: T; result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>}

/**
 * Represents a scolder function that checks if the result of an expecter
 * matches the specified options.
 */
type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
  ? Expecter
  : Inverted<Expecter>

/**
 * Represents the positive assertion methods available for type checking in the
 * {@linkcode expectTypeOf()} utility.
 */
export interface PositiveExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {positive: true; branded: false}> {
  toEqualTypeOf: {
    /**
     * Uses TypeScript's internal technique to check for type "identicalness".
     *
     * It will check if the types are fully equal to each other.
     * It will not fail if two objects have different values, but the same type.
     * It will fail however if an object is missing a property.
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode branded `.branded.toEqualTypeOf()`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()
     *
     * expectTypeOf({ a: 1, b: 1 }).not.toEqualTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 1 })
     *
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 2 })
     * ```
     *
     * @param value - The value to compare against the expected type.
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
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
     * Uses TypeScript's internal technique to check for type "identicalness".
     *
     * It will check if the types are fully equal to each other.
     * It will not fail if two objects have different values, but the same type.
     * It will fail however if an object is missing a property.
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode branded `.branded.toEqualTypeOf()`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()
     *
     * expectTypeOf({ a: 1, b: 1 }).not.toEqualTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 1 })
     *
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 2 })
     * ```
     *
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
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
     * A less strict version of {@linkcode toEqualTypeOf `.toEqualTypeOf()`}
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
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     *
     * @param value - The value to compare against the expected type.
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>
    ): true

    /**
     * A less strict version of {@linkcode toEqualTypeOf `.toEqualTypeOf()`}
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
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     *
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
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
   *
   * @param key - The property key to check for.
   * @param MISMATCH - The mismatch arguments.
   * @returns `true`.
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
   * Intersection types can cause issues with
   * {@linkcode toEqualTypeOf `.toEqualTypeOf()`}:
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
    /**
     * Uses TypeScript's internal technique to check for type "identicalness".
     *
     * It will check if the types are fully equal to each other.
     * It will not fail if two objects have different values, but the same type.
     * It will fail however if an object is missing a property.
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode PositiveExpectTypeOf.branded `.branded.toEqualTypeOf()`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()
     *
     * expectTypeOf({ a: 1, b: 1 }).not.toEqualTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 1 })
     *
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 2 })
     * ```
     *
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    toEqualTypeOf: <
      Expected extends StrictEqualUsingBranding<Actual, Expected> extends true
        ? unknown
        : MismatchInfo<Actual, Expected>,
    >(
      ...MISMATCH: MismatchArgs<StrictEqualUsingBranding<Actual, Expected>, true>
    ) => true
  }
}

/**
 * Represents the negative expectation type for the {@linkcode Actual} type.
 */
export interface NegativeExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {positive: false}> {
  toEqualTypeOf: {
    /**
     * Uses TypeScript's internal technique to check for type "identicalness".
     *
     * It will check if the types are fully equal to each other.
     * It will not fail if two objects have different values, but the same type.
     * It will fail however if an object is missing a property.
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode PositiveExpectTypeOf.branded `.branded.toEqualTypeOf()`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()
     *
     * expectTypeOf({ a: 1, b: 1 }).not.toEqualTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 1 })
     *
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 2 })
     * ```
     *
     * @param value - The value to compare against the expected type.
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    <Expected>(
      value: Expected & AValue,
      ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>
    ): true

    /**
     * Uses TypeScript's internal technique to check for type "identicalness".
     *
     * It will check if the types are fully equal to each other.
     * It will not fail if two objects have different values, but the same type.
     * It will fail however if an object is missing a property.
     *
     * **_Unexpected failure_**? For a more permissive but less performant
     * check that accommodates for equivalent intersection types,
     * use {@linkcode PositiveExpectTypeOf.branded `.branded.toEqualTypeOf()`}.
     * @see {@link https://github.com/mmkal/expect-type#why-is-my-assertion-failing The documentation for details}.
     *
     * @example
     * <caption>Using generic type argument syntax</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>()
     *
     * expectTypeOf({ a: 1, b: 1 }).not.toEqualTypeOf<{ a: number }>()
     * ```
     *
     * @example
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 1 })
     *
     * expectTypeOf({ a: 1 }).toEqualTypeOf({ a: 2 })
     * ```
     *
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    <Expected>(...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>): true
  }

  toMatchTypeOf: {
    /**
     * A less strict version of
     * {@linkcode PositiveExpectTypeOf.toEqualTypeOf `.toEqualTypeOf()`}
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
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     *
     * @param value - The value to compare against the expected type.
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    <Expected>(
      value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
      ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>
    ): true

    /**
     * A less strict version of
     * {@linkcode PositiveExpectTypeOf.toEqualTypeOf `.toEqualTypeOf()`}
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
     * <caption>Using inferred type syntax by passing a value</caption>
     * ```ts
     * expectTypeOf({ a: 1, b: 1 }).toMatchTypeOf({ a: 2 })
     * ```
     *
     * @param MISMATCH - The mismatch arguments.
     * @returns `true`.
     */
    <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>): true
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
   *
   * @param key - The property key to check for.
   * @param MISMATCH - The mismatch arguments.
   * @returns `true`.
   */
  toHaveProperty: <KeyType extends string | number | symbol>(
    key: KeyType,
    ...MISMATCH: MismatchArgs<Extends<KeyType, keyof Actual>, false>
  ) => true
}

/**
 * Represents a conditional type that selects either
 * {@linkcode PositiveExpectTypeOf} or {@linkcode NegativeExpectTypeOf} based
 * on the value of the `positive` property in the {@linkcode Options} type.
 */
export type ExpectTypeOf<Actual, Options extends {positive: boolean}> = Options['positive'] extends true
  ? PositiveExpectTypeOf<Actual>
  : NegativeExpectTypeOf<Actual>

/**
 * Represents the base interface for the
 * {@linkcode expectTypeOf()} function.
 * Provides a set of assertion methods to perform type checks on a value.
 */
export interface BaseExpectTypeOf<Actual, Options extends {positive: boolean}> {
  /**
   * Checks whether the type of the value is `any`.
   */
  toBeAny: Scolder<ExpectAny<Actual>, Options>

  /**
   * Checks whether the type of the value is `unknown`.
   */
  toBeUnknown: Scolder<ExpectUnknown<Actual>, Options>

  /**
   * Checks whether the type of the value is `never`.
   */
  toBeNever: Scolder<ExpectNever<Actual>, Options>

  /**
   * Checks whether the type of the value is `function`.
   */
  toBeFunction: Scolder<ExpectFunction<Actual>, Options>

  /**
   * Checks whether the type of the value is `object`.
   */
  toBeObject: Scolder<ExpectObject<Actual>, Options>

  /**
   * Checks whether the type of the value is an {@linkcode Array}.
   */
  toBeArray: Scolder<ExpectArray<Actual>, Options>

  /**
   * Checks whether the type of the value is `number`.
   */
  toBeNumber: Scolder<ExpectNumber<Actual>, Options>

  /**
   * Checks whether the type of the value is `string`.
   */
  toBeString: Scolder<ExpectString<Actual>, Options>

  /**
   * Checks whether the type of the value is `boolean`.
   */
  toBeBoolean: Scolder<ExpectBoolean<Actual>, Options>

  /**
   * Checks whether the type of the value is `void`.
   */
  toBeVoid: Scolder<ExpectVoid<Actual>, Options>

  /**
   * Checks whether the type of the value is `symbol`.
   */
  toBeSymbol: Scolder<ExpectSymbol<Actual>, Options>

  /**
   * Checks whether the type of the value is `null`.
   */
  toBeNull: Scolder<ExpectNull<Actual>, Options>

  /**
   * Checks whether the type of the value is `undefined`.
   */
  toBeUndefined: Scolder<ExpectUndefined<Actual>, Options>

  /**
   * Checks whether the type of the value is `null` or `undefined`.
   */
  toBeNullable: Scolder<ExpectNullable<Actual>, Options>

  /**
   * Checks whether a function is callable with the given parameters.
   *
   * __Note__: You cannot negate this assertion with
   * {@linkcode PositiveExpectTypeOf.not `.not`} you need to use
   * `ts-expect-error` instead.
   *
   * @example
   * ```ts
   * const f = (a: number) => [a, a]
   *
   * expectTypeOf(f).toBeCallableWith(1)
   * ```
   *
   * __Known Limitation__: This assertion will likely fail if you try to use it
   * with a generic function or an overload.
   * @see {@link https://github.com/mmkal/expect-type/issues/50 This issue} for an example and a workaround.
   *
   * @param args - The arguments to check for callability.
   * @returns `true`.
   */
  toBeCallableWith: Options['positive'] extends true ? (...args: Params<Actual>) => true : never

  /**
   * Checks whether a class is constructible with the given parameters.
   *
   * @example
   * ```ts
   * expectTypeOf(Date).toBeConstructibleWith('1970')
   *
   * expectTypeOf(Date).toBeConstructibleWith(0)
   *
   * expectTypeOf(Date).toBeConstructibleWith(new Date())
   *
   * expectTypeOf(Date).toBeConstructibleWith()
   * ```
   *
   * @param args - The arguments to check for constructibility.
   * @returns `true`.
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
   *   .toEqualTypeOf<{
   *     xs?: CSSProperties
   *     sm?: CSSProperties
   *     md?: CSSProperties
   *   }>()
   *
   * expectTypeOf(getResponsiveProp(cssProperties))
   *   .extract<unknown[]>() // extracts an array from a union
   *   .toEqualTypeOf<CSSProperties[]>()
   * ```
   *
   * __Note__: If no type is found in the union, it will return `never`.
   *
   * @param v - The type to extract from the union.
   * @returns The type after extracting the type from the union.
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
   *
   * @param keyToPick - The property key to pick.
   * @returns The type after picking the property.
   */
  pick: <KeyToPick extends keyof Actual>(keyToPick?: KeyToPick) => ExpectTypeOf<Pick<Actual, KeyToPick>, Options>

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
   *
   * @param keyToOmit - The property key to omit.
   * @returns The type after omitting the property.
   */
  omit: <KeyToOmit extends keyof Actual | (PropertyKey & Record<never, never>)>(
    keyToOmit?: KeyToOmit,
  ) => ExpectTypeOf<Omit<Actual, KeyToOmit>, Options>

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
   *
   * expectTypeOf(foo).parameter(1).toBeString()
   * ```
   *
   * @param index - The index of the parameter to extract.
   * @returns The extracted parameter type.
   */
  parameter: <Index extends keyof Params<Actual>>(index: Index) => ExpectTypeOf<Params<Actual>[Index], Options>

  /**
   * Equivalent to the {@linkcode Parameters} utility type.
   * Extracts function parameters to perform assertions on its value.
   * Parameters are returned as an array.
   *
   * @example
   * ```ts
   * function noParam() {}
   *
   * function hasParam(s: string) {}
   *
   * expectTypeOf(noParam).parameters.toEqualTypeOf<[]>()
   *
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
   * Equivalent to the {@linkcode InstanceType} utility type.
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
   *
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
   *
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
  resolves: Actual extends PromiseLike<infer ResolvedType> ? ExpectTypeOf<ResolvedType, Options> : never

  /**
   * Extracts array item type to perform assertions on.
   *
   * @example
   * ```ts
   * expectTypeOf([1, 2, 3]).items.toEqualTypeOf<number>()
   *
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
  items: Actual extends ArrayLike<infer ItemType> ? ExpectTypeOf<ItemType, Options> : never

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

/**
 * Represents a function that allows asserting the expected type of a value.
 */
export type _ExpectTypeOf = {
  /**
   * Asserts the expected type of a value.
   *
   * @param actual - The actual value being asserted.
   * @returns An object representing the expected type assertion.
   */
  <Actual>(actual: Actual): ExpectTypeOf<Actual, {positive: true; branded: false}>

  /**
   * Asserts the expected type of a value without providing an actual value.
   *
   * @returns An object representing the expected type assertion.
   */
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
