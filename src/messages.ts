import type {StrictEqualUsingBranding} from './branding'
import type {
  And,
  Extends,
  ExtendsExcludingAnyOrNever,
  IsAny,
  IsNever,
  IsUnknown,
  Not,
  OptionalKeys,
  UsefulKeys,
} from './utils'

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
                    : bigint extends T
                      ? 'bigint'
                      : T extends bigint
                        ? `literal bigint: ${T}`
                        : T extends null
                          ? 'null'
                          : T extends undefined
                            ? 'undefined'
                            : T extends (...args: any[]) => any
                              ? 'function'
                              : '...'

/**
 * Helper for showing end-user a hint why their type assertion is failing.
 * This swaps "leaf" types with a literal message about what the actual and
 * expected types are. Needs to check for `Not<IsAny<Actual>>` because
 * otherwise `LeafTypeOf<Actual>` returns `never`, which extends everything 🤔
 */
export type MismatchInfo<Actual, Expected> =
  And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
    ? And<[Extends<any[], Actual>, Extends<any[], Expected>]> extends true
      ? Array<MismatchInfo<Extract<Actual, any[]>[number], Extract<Expected, any[]>[number]>>
      : Optionalify<
          {
            [K in UsefulKeys<Actual> | UsefulKeys<Expected>]: MismatchInfo<
              K extends keyof Actual ? Actual[K] : never,
              K extends keyof Expected ? Expected[K] : never
            >
          },
          OptionalKeys<Expected>
        >
    : StrictEqualUsingBranding<Actual, Expected> extends true
      ? Actual
      : `Expected: ${PrintType<Expected>}, Actual: ${PrintType<Exclude<Actual, Expected>>}`

/**
 * Helper for making some keys of a type optional. Only useful so far for `MismatchInfo` - it makes sure we
 * don't get bogus errors about optional properties mismatching, when actually it's something else that's wrong.
 *
 * - Note: this helper is a no-op if there are no optional keys in the type.
 */
// prettier-ignore
export type Optionalify<T, TOptionalKeys> = [TOptionalKeys] extends [never]
  ? T // no optional keys, just use the original type
  : (
      {[K in Exclude<keyof T, TOptionalKeys>]: T[K]} &
      {[K in Extract<keyof T, TOptionalKeys>]?: T[K]}
    ) extends infer X ? {[K in keyof X]: X[K]} : never // this `extends infer X` trick makes the types more readable - it flattens the props from the intersection into a single type.

/**
 * @internal
 */
const expectNull = Symbol('expectNull')
export type ExpectNull<T> = {
  [expectNull]: T
  result: ExtendsExcludingAnyOrNever<T, null>
}

/**
 * @internal
 */
const expectUndefined = Symbol('expectUndefined')
export type ExpectUndefined<T> = {
  [expectUndefined]: T
  result: ExtendsExcludingAnyOrNever<T, undefined>
}

/**
 * @internal
 */
const expectNumber = Symbol('expectNumber')
export type ExpectNumber<T> = {
  [expectNumber]: T
  result: ExtendsExcludingAnyOrNever<T, number>
}

/**
 * @internal
 */
const expectString = Symbol('expectString')
export type ExpectString<T> = {
  [expectString]: T
  result: ExtendsExcludingAnyOrNever<T, string>
}

/**
 * @internal
 */
const expectBoolean = Symbol('expectBoolean')
export type ExpectBoolean<T> = {
  [expectBoolean]: T
  result: ExtendsExcludingAnyOrNever<T, boolean>
}

/**
 * @internal
 */
const expectVoid = Symbol('expectVoid')
export type ExpectVoid<T> = {
  [expectVoid]: T
  result: ExtendsExcludingAnyOrNever<T, void>
}

/**
 * @internal
 */
const expectFunction = Symbol('expectFunction')
export type ExpectFunction<T> = {
  [expectFunction]: T
  result: ExtendsExcludingAnyOrNever<T, (...args: any[]) => any>
}

/**
 * @internal
 */
const expectObject = Symbol('expectObject')
export type ExpectObject<T> = {
  [expectObject]: T
  result: ExtendsExcludingAnyOrNever<T, object>
}

/**
 * @internal
 */
const expectArray = Symbol('expectArray')
export type ExpectArray<T> = {
  [expectArray]: T
  result: ExtendsExcludingAnyOrNever<T, any[]>
}

/**
 * @internal
 */
const expectSymbol = Symbol('expectSymbol')
export type ExpectSymbol<T> = {
  [expectSymbol]: T
  result: ExtendsExcludingAnyOrNever<T, symbol>
}

/**
 * @internal
 */
const expectAny = Symbol('expectAny')
export type ExpectAny<T> = {[expectAny]: T; result: IsAny<T>}

/**
 * @internal
 */
const expectUnknown = Symbol('expectUnknown')
export type ExpectUnknown<T> = {[expectUnknown]: T; result: IsUnknown<T>}

/**
 * @internal
 */
const expectNever = Symbol('expectNever')
export type ExpectNever<T> = {[expectNever]: T; result: IsNever<T>}

/**
 * @internal
 */
const expectNullable = Symbol('expectNullable')
export type ExpectNullable<T> = {
  [expectNullable]: T
  result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>
}

/**
 * @internal
 */
const expectBigInt = Symbol('expectBigInt')
export type ExpectBigInt<T> = {
  [expectBigInt]: T
  result: ExtendsExcludingAnyOrNever<T, bigint>
}

/**
 * Like PrintType but returns 'any' as a string for any types (instead of never).
 * This is used for error messages where we need to display the actual type.
 *
 * @internal
 */
type PrintTypeForError<T> =
  IsAny<T> extends true
    ? 'any'
    : IsUnknown<T> extends true
      ? 'unknown'
      : IsNever<T> extends true
        ? 'never'
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
                    : bigint extends T
                      ? 'bigint'
                      : T extends bigint
                        ? `literal bigint: ${T}`
                        : T extends null
                          ? 'null'
                          : T extends undefined
                            ? 'undefined'
                            : T extends (...args: any[]) => any
                              ? 'function'
                              : '...'

/**
 * Generates an error message for a failed positive assertion.
 */
export type PositiveAssertionError<
  Actual,
  ExpectedTypeName extends string,
> = `Expected: ${ExpectedTypeName}, Actual: ${PrintTypeForError<Actual>}`

/**
 * Generates an error message for a failed negative assertion.
 */
export type NegativeAssertionError<
  Actual,
  ExpectedTypeName extends string,
> = `\`.not.${ExpectedTypeName extends 'nullable' ? 'toBeNullable' : `toBe${Capitalize<ExpectedTypeName>}`}()\` failed; Actual: ${PrintTypeForError<Actual>}`

/**
 * Checks if the result of an expecter matches the specified options, and
 * resolves to a fairly readable error message if not.
 *
 * When the assertion passes, this resolves to `() => true` (a callable function).
 * When the assertion fails, this resolves to an object with a descriptive key
 * that makes the error message clear.
 */
export type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
  ExpectedTypeName extends string,
  Actual,
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
    ? {[K in PositiveAssertionError<Actual, ExpectedTypeName>]: never}
    : {[K in NegativeAssertionError<Actual, ExpectedTypeName>]: never}
