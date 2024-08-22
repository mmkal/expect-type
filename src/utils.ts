import {DeepBrand, DeepBrandOptions, DeepBrandOptionsDefaults as DeepBrandOptionsDefaults} from './branding'

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
 * @internal
 */
const secret = Symbol('secret')

/**
 * @internal
 */
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
 * UsefulKeys<{ a: 1; b: 2 }> // 'a' | 'b'
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
 * Extracts the keys from a type that are not `readonly`.
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
 *
 * @internal
 */
type ReadonlyEquivalent<X, Y> = Extends<
  (<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)
>;

/**
 * Checks if one type extends another. Note: this is not quite the same as `Left extends Right` because:
 * 1. If either type is `never`, the result is `true` iff the other type is also `never`.
 * 2. Types are wrapped in a 1-tuple so that union types are not distributed - instead we consider `string | number` to _not_ extend `number`. If we used `Left extends Right` directly you would get `Extends<string | number, number>` => `false | true` => `boolean`.
 */
export type Extends<Left, Right> = IsNever<Left> extends true ? IsNever<Right> : [Left] extends [Right] ? true : false

/**
 * Checks if the {@linkcode Left} type extends the {@linkcode Right} type,
 * excluding `any` or `never`.
 */
export type ExtendsExcludingAnyOrNever<Left, Right> = IsAny<Left> extends true ? IsAny<Right> : Extends<Left, Right>

/**
 * Checks if two types are strictly equal using
 * the TypeScript internal identical-to operator.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122 | much history}
 */
export type StrictEqualUsingTSInternalIdenticalToOperator<L, R> =
  (<T>() => T extends (L & T) | T ? true : false) extends <T>() => T extends (R & T) | T ? true : false
    ? IsNever<L> extends IsNever<R>
      ? true
      : false
    : false

/**
 * Checks that {@linkcode Left} and {@linkcode Right} extend each other.
 * Not quite the same as an equality check since `any` can make it resolve
 * to `true`. So should only be used when {@linkcode Left} and
 * {@linkcode Right} are known to avoid `any`.
 */
export type MutuallyExtends<Left, Right> = And<[Extends<Left, Right>, Extends<Right, Left>]>

/**
 * @internal
 */
const mismatch = Symbol('mismatch')

/**
 * @internal
 */
type Mismatch = {[mismatch]: 'mismatch'}

/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
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

/**
 * Convert a union to an intersection.
 * `A | B | C` -\> `A & B & C`
 */
export type UnionToIntersection<Union> = (Union extends any ? (distributedUnion: Union) => void : never) extends (
  mergedIntersection: infer Intersection,
) => void
  ? Intersection
  : never

/**
 * Get the last element of a union.
 * First, converts to a union of `() => T` functions,
 * then uses {@linkcode UnionToIntersection} to get the last one.
 */
export type LastOf<Union> =
  UnionToIntersection<Union extends any ? () => Union : never> extends () => infer R ? R : never

/**
 * Intermediate type for {@linkcode UnionToTuple} which pushes the
 * "last" union member to the end of a tuple, and recursively prepends
 * the remainder of the union.
 */
export type TuplifyUnion<Union, LastElement = LastOf<Union>> =
  IsNever<Union> extends true ? [] : [...TuplifyUnion<Exclude<Union, LastElement>>, LastElement]

/**
 * Convert a union like `1 | 2 | 3` to a tuple like `[1, 2, 3]`.
 */
export type UnionToTuple<Union> = TuplifyUnion<Union>

export type IsPrimitive<T> = [T] extends [string] | [number] | [boolean] | [null] | [undefined] | [void] | [bigint]
  ? true
  : false

type Entries<T> =
  IsNever<T> extends true
    ? []
    : IsNever<keyof T> extends true
      ? []
      : UnionToTuple<
          {
            [K in keyof T]: [K, T[K]]
          }[keyof T]
        >

export type TupleEntries<T extends any[]> = {
  [K in keyof T]: [K, T[K]]
}

export type ConcatTupleEntries<E> = E extends [infer Head, ...infer Tail]
  ? Head extends [string | number, string[]]
    ? {'0': Head[1]} & ConcatTupleEntries<Tail>
    : {}
  : {}

export type IsTuple<T extends readonly any[]> = number extends T['length'] ? false : true

// export type BadlyDefinedPaths<T, PathTo extends string = ''> =
//   IsNever<T> extends true
//     ? [`${PathTo}: never`]
//     : IsAny<T> extends true
//       ? [`${PathTo}: any`]
//       : T extends any[]
//         ? IsTuple<T> extends true
//           ? ConcatTupleEntries<{
//               [K in keyof T]: [K, BadlyDefinedPaths<T[K], `${PathTo}.${Extract<K, string | number>}`>]
//             }>
//           : BadlyDefinedPaths<T[number], `${PathTo}[number]`>
//         : Entries<T> extends [[infer K, infer V], ...infer _Tail]
//           ? BadlyDefinedPaths<V, `${PathTo}.${Extract<K, string | number>}`> &
//               ...BadlyDefinedPaths<Omit<T, Extract<K, string | number | symbol>>, PathTo>,
//             ]
//           : []

// export type BadlyDefinedDeepBrand<T, PathTo extends string = ''> = T extends {type: 'any' | 'never'}
//   ? [`${PathTo}: ${T['type']}`]
//   : never

type _DeepPropTypesOfBranded<T, PathTo extends string, FindType extends string> =
  IsNever<T> extends true
    ? {}
    : T extends string
      ? {}
      : T extends {type: FindType}
        ? {[K in PathTo]: T['type']} & {gotem: true}
        : T extends {type: string} // an object like `{type: string}` gets "branded" to `{type: 'object', properties: {type: {type: 'string'}}}`
          ? Entries<Omit<T, 'type'>> extends [[infer K, infer V], ...infer _Tail]
            ? _DeepPropTypesOfBranded<V, `${PathTo}${PropPathSuffix<K>}`, FindType> &
                _DeepPropTypesOfBranded<Omit<T, Extract<K, string | number>>, PathTo, FindType>
            : {}
          : T extends any[]
            ? _DeepPropTypesOfBranded<TupleToRecord<T>, PathTo, FindType>
            : UnionToIntersection<
                {
                  [K in keyof T]: Extract<
                    _DeepPropTypesOfBranded<T[K], `${PathTo}.${Prop<K>}`, FindType>,
                    {gotem: true}
                  >
                }[keyof T]
              >

export type DeepBrandPropNotesOptions = Partial<DeepBrandOptions> & {findType: string}
export type DeepBrandPropNotesOptionsDefaults = {findType: 'any' | 'never'}

export type DeepBrandPropNotes<T, Options extends DeepBrandPropNotesOptions> =
  _DeepPropTypesOfBranded<DeepBrand<T, DeepBrandOptionsDefaults & Options>, '', Options['findType']> extends infer X
    ? {} extends X
      ? Record<string | number | symbol, 'No flagged props found!'> // avoid letting `{'.propThatUsedToBeAny': 'any'}` still being accepted after it's fixed
      : {[K in Exclude<keyof X, 'gotem'>]: X[K]}
    : never

export type Prop<K> = K extends string | number ? K : 'UNEXPECTED_NON_LITERAL_PROP'

export type PropPathSuffix<K> = K extends 'items'
  ? '[number]'
  : K extends 'properties'
    ? ''
    : `(${Extract<K, string | number>})`

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

/**
 * e.g. `['a', 'b']` -> `{ 0: 'a', 1: 'b' }`
 * Looks at the keys to see which look digit-like, so could do the wrong thing for types like
 * `['a', 'b'] & {'1foo': string}`
 */
export type TupleToRecord<T extends any[]> = {
  [K in keyof T as `${Extract<K, `${Digit}${string}`>}`]: T[K]
}
