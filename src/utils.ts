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

const secret = Symbol('secret')
type Secret = typeof secret

/**
 * Checks if the given type is `never`.
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
    {
      [_K in K]: T[K];
    }, {
      -readonly [_K in K]: T[K];
    }
  > extends true ? never : K;
}[keyof T], keyof T>;

// prettier-ignore
/**
 * Determines if two types, are equivalent in a `readonly` manner.
 */
type ReadonlyEquivalent<X, Y> = Extends<
  (<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)
>;

/**
 * Checks if one type extends another.
 */
export type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false

export type ExtendsExcludingAnyOrNever<L, R> = IsAny<L> extends true ? IsAny<R> : Extends<L, R>

/**
 * Checks if two types are strictly equal using
 * the TypeScript internal identical-to operator.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122 much history}
 */
export type StrictEqualUsingTSInternalIdenticalToOperator<L, R> =
  (<T>() => T extends (L & T) | T ? true : false) extends <T>() => T extends (R & T) | T ? true : false
    ? IsNever<L> extends IsNever<R>
      ? true
      : false
    : false

/**
 * Checks that `L` and `R` extend each other. Not quite the same as an equality check since `any` can make it resolve to true.
 * So should only be used when `L` and `R` are known to avoid `any`.
 */
export type MutuallyExtends<L, R> = And<[Extends<L, R>, Extends<R, L>]>

/**
 * Represents the constructor parameters of a class or constructor function.
 * If the constructor takes no arguments, an empty array is returned.
 */
export type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any
  ? Actual extends new () => any
    ? P | []
    : P
  : never

const mismatch = Symbol('mismatch')
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
export type AValue = {[avalue]?: undefined} | string | number | boolean | symbol | bigint | null | undefined | void

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
export type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> =
  Eq<ActualResult, ExpectedResult> extends true ? [] : [Mismatch]

/**
 * Represents the options for the {@linkcode ExpectTypeOf} function.
 */
export interface ExpectTypeOfOptions {
  positive: boolean
  branded: boolean
}

/** `A | B | C` -> `A & B & C` */
export type UnionToIntersection<T> = (T extends any ? (x: T) => void : never) extends (x: infer I) => void ? I : never

/**
 * Get the last element of a union. First, converts to a union of `() => T` functions, then uses `UnionToIntersection` to get the last one.
 */
export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never

/** Intermediate type for {@linkcode UnionToTuple} which pushes the "last" union member to the end of a tuple, and recursively prepends the remainder of the union */
export type TuplifyUnion<T, L = LastOf<T>> = IsNever<T> extends true ? [] : [...TuplifyUnion<Exclude<T, L>>, L]

/** Convert a union like `1 | 2 | 3` to a tuple like `[1, 2, 3]` */
export type UnionToTuple<T> = TuplifyUnion<T>