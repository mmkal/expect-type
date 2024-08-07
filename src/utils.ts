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
 * Determines the printable type representation for a given type.
 */
export type PrintType<T> =
  IsUnknown<T> extends true
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
export type MismatchInfo<Actual, Expected> =
  And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
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
 * difference between a few edge-case types that vanilla TypeScript
 * doesn't by default:
 * - `any` vs `unknown`
 * - `{ readonly a: string }` vs `{ a: string }`
 * - `{ a?: string }` vs `{ a: string | undefined }`
 *
 * __Note__: not very performant for complex types - this should only be used
 * when you know you need it. If doing an equality check, it's almost always
 * better to use {@linkcode StrictEqualUsingTSInternalIdenticalToOperator}.
 */
export type DeepBrand<T> =
  IsNever<T> extends true
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
                    items: {
                      [K in keyof T]: T[K]
                    }
                  }
                : {
                    type: 'object'
                    properties: {
                      [K in keyof T]: DeepBrand<T[K]>
                    }
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

export type ExtendsUsingBranding<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>

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
export type HopefullyPerformantEqual<Left, Right> =
  StrictEqualUsingTSInternalIdenticalToOperator<Left, Right> extends true ? true : StrictEqualUsingBranding<Left, Right>

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

const inverted = Symbol('inverted')
type Inverted<T> = {[inverted]: T}

const expectNull = Symbol('expectNull')
export type ExpectNull<T> = {[expectNull]: T; result: ExtendsExcludingAnyOrNever<T, null>}

const expectUndefined = Symbol('expectUndefined')
export type ExpectUndefined<T> = {[expectUndefined]: T; result: ExtendsExcludingAnyOrNever<T, undefined>}

const expectNumber = Symbol('expectNumber')
export type ExpectNumber<T> = {[expectNumber]: T; result: ExtendsExcludingAnyOrNever<T, number>}

const expectString = Symbol('expectString')
export type ExpectString<T> = {[expectString]: T; result: ExtendsExcludingAnyOrNever<T, string>}

const expectBoolean = Symbol('expectBoolean')
export type ExpectBoolean<T> = {[expectBoolean]: T; result: ExtendsExcludingAnyOrNever<T, boolean>}

const expectVoid = Symbol('expectVoid')
export type ExpectVoid<T> = {[expectVoid]: T; result: ExtendsExcludingAnyOrNever<T, void>}

const expectFunction = Symbol('expectFunction')
export type ExpectFunction<T> = {[expectFunction]: T; result: ExtendsExcludingAnyOrNever<T, (...args: any[]) => any>}

const expectObject = Symbol('expectObject')
export type ExpectObject<T> = {[expectObject]: T; result: ExtendsExcludingAnyOrNever<T, object>}

const expectArray = Symbol('expectArray')
export type ExpectArray<T> = {[expectArray]: T; result: ExtendsExcludingAnyOrNever<T, any[]>}

const expectSymbol = Symbol('expectSymbol')
export type ExpectSymbol<T> = {[expectSymbol]: T; result: ExtendsExcludingAnyOrNever<T, symbol>}

const expectAny = Symbol('expectAny')
export type ExpectAny<T> = {[expectAny]: T; result: IsAny<T>}

const expectUnknown = Symbol('expectUnknown')
export type ExpectUnknown<T> = {[expectUnknown]: T; result: IsUnknown<T>}

const expectNever = Symbol('expectNever')
export type ExpectNever<T> = {[expectNever]: T; result: IsNever<T>}

const expectNullable = Symbol('expectNullable')
export type ExpectNullable<T> = {[expectNullable]: T; result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>}

/**
 * Represents a scolder function that checks if the result of an expecter
 * matches the specified options.
 */
export type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
    ? Expecter
    : Inverted<Expecter>

/** `A | B | C` -> `A & B & C` */
export type UnionToIntersection<T> = (T extends any ? (x: T) => void : never) extends (x: infer I) => void ? I : never
