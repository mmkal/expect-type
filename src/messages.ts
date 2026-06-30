import {DeepBrandOptions, DeepBrandOptionsDefaults, StrictEqualUsingBranding} from './branding'
import type {
  And,
  Extends,
  ExtendsExcludingAnyOrNever,
  IsAny,
  IsNever,
  IsSubset,
  IsUnknown,
  Not,
  OptionalKeys,
  StrictEqualUsingTSInternalIdenticalToOperator,
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
export type MismatchInfo<Actual, Expected, Options extends DeepBrandOptions = DeepBrandOptionsDefaults> =
  And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
    ? And<[Extends<any[], Actual>, Extends<any[], Expected>]> extends true
      ? Array<MismatchInfo<Extract<Actual, any[]>[number], Extract<Expected, any[]>[number], Options>>
      : Optionalify<
          {
            [K in UsefulKeys<Actual> | UsefulKeys<Expected>]: MismatchInfo<
              K extends keyof Actual ? Actual[K] : never,
              K extends keyof Expected ? Expected[K] : never,
              Options
            >
          },
          OptionalKeys<Expected>
        >
    : StrictEqualUsingBranding<Actual, Expected, Options> extends true
      ? Actual
      : `Expected: ${PrintType<Expected>}, Actual: ${PrintType<Exclude<Actual, Expected>>}`

export type MismatchInfoUnion<
  ActualTuple extends any[],
  ExpectedTuple extends any[],
  Options extends DeepBrandOptions = DeepBrandOptionsDefaults,
> = {
  [K in keyof ExpectedTuple]: IsSubset<[ExpectedTuple[K]], ActualTuple> extends true
    ? ExpectedTuple[K]
    : ExpectMember<ActualTuple, ExpectedTuple[K]>
}
// {
//   [K in Extract<keyof ActualTuple | keyof ExpectedTuple, number>]: K extends keyof ActualTuple
//     ? K extends keyof ExpectedTuple
//       ? K extends string | number
//         ? IsSubset<[ActualTuple[K]], ExpectedTuple> extends true
//           ? IsSubset<[ExpectedTuple[K]], ActualTuple> extends true
//             ? `Actual item ${K} is in expected tuple`
//             : {
//                 message: `Expected item ${K} is not in actual tuple`
//                 mismatches: {[K2 in keyof ActualTuple]: MismatchInfo<ActualTuple[K2], ExpectedTuple[K]>}
//               }
//           : {
//               message: `Actual item ${K} is not expected tuple`
//               mismatches: {[K2 in keyof ExpectedTuple]: MismatchInfo<ActualTuple[K], ExpectedTuple[K2]>}
//             }
//         : {k: K; extendsStringOrNumber: K extends string | number ? true : false}
//       : never
//     : never
// }

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
const inverted = Symbol('inverted')

/**
 * @internal
 */
type Inverted<T> = {[inverted]: T}

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
  result: Not<StrictEqualUsingTSInternalIdenticalToOperator<T, NonNullable<T>>>
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
 * @internal
 */
const expectMember = Symbol('expectMember')
export type ExpectMember<T extends any[], Member> = {
  [expectMember]: T
  result: IsSubset<[Member], T>
}

/**
 * Checks if the result of an expecter matches the specified options, and
 * resolves to a fairly readable error message if not.
 */
export type Scolder<
  Expecter extends {result: boolean},
  Options extends {positive: boolean},
> = Expecter['result'] extends Options['positive']
  ? () => true
  : Options['positive'] extends true
    ? Expecter
    : Inverted<Expecter>
