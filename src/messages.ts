import {StrictEqualUsingBranding} from './brand'
import {And, Extends, Not, IsAny, UsefulKeys, ExtendsExcludingAnyOrNever, IsUnknown, IsNever} from './utils'

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
 * Helper for showing end-user a hint why their type assertion is failing.
 * This swaps "leaf" types with a literal message about what the actual and expected types are.
 * Needs to check for Not<IsAny<Actual>> because otherwise LeafTypeOf<Actual> returns never, which extends everything 🤔
 */
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
 * Checks if the result of an expecter matches the specified options, and resolves to a fairly readable error messsage if not.
 */
export type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
    ? Expecter
    : Inverted<Expecter>
