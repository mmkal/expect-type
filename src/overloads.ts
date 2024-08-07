import {StrictEqualUsingTSInternalIdenticalToOperator, IsNever} from './utils'

// prettier-ignore
/**
 * The simple(ish) way to get overload info from a function `F`. Recent versions of TypeScript will match any function against a generic 10-overload type, filling in slots with duplicates of the function.
 * So, we can just match against a single type and get all the overloads.
 *
 * For older versions of TypeScript, we'll need to painstakingly do ten separate matches.
 */
export type TSPost53OverloadsInfoUnion<F> =
  F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; (...args: infer A10): infer R10}
  ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6) | ((...p: A7) => R7) | ((...p: A8) => R8) | ((...p: A9) => R9) | ((...p: A10) => R10)
  : never

export type UnknownFn = (...p: unknown[]) => unknown

/**
 * `true` iff `T` is equivalent to `(...p: unknown[]) => unknown`, which is what an overload variant looks like for a non-existent overload
 * This is useful because older versions of TypeScript end up with 9 "useless" overloads and one real one for parameterless/generic functions
 */
export type IsUselessOverloadInfo<T> = StrictEqualUsingTSInternalIdenticalToOperator<T, UnknownFn>

/**
 * Old versions of typescript can sometimes seem to refuse to separate out union members unless you put them each in a pointless tuple and add an extra `infer X` expression.
 * There may be a better way to work around this problem, but since it's not a problem in newer versions of TypeScript, it's not a priority right now.
 */
export type Tuplify<T> = T extends infer X ? [X] : never

/**
 * For older versions of TypeScript, we need two separate workarounds to get overload info.
 * First, we need need to use {@linkcode DecreasingOverloadsInfoUnion} to get the overload info for functions with 1-10 overloads.
 * Then, we need to filter out the "useless" overloads that are present in older versions of TypeScript, for parameterless functions.
 * To do this we use {@linkcode IsUselessOverloadInfo} to remove useless overloads.
 *
 * Related: https://github.com/microsoft/TypeScript/issues/28867
 */
export type TSPre53OverloadsInfoUnion<F> =
  // first, pointlessly wrap the overload variants in a 1-tuple, then infer them as `Tup` - this helps TypeScript isolate out the overload variants
  Tuplify<DecreasingOverloadsInfoUnion<F>> extends infer Tup
    ? // we know `Tup` is a 1-tuple because we just used Tuplify, but use an infer so that TypeScript knows too
      Tup extends [infer Fn]
      ? // Now check if the Fn is "useless" i.e. hit by the historical TypeScript bug that adds `(...args: unknown[]) => unknown` overloads
        IsUselessOverloadInfo<Fn> extends true
        ? // if it's useless, get rid of it from the resultant union using never
          never
        : Fn // deeply hidden happy path - keep this. We'll end up with a union of the actual meaningful overload variants
      : never
    : never

// prettier-ignore
/**
 * For versions of TypeScript below 5.3, we need to check for 10 overloads, then 9, then 8, etc., to get a union of the overlaod variants.
 */
export type DecreasingOverloadsInfoUnion<F> = F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; (...args: infer A10): infer R10}
  ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6) | ((...p: A7) => R7) | ((...p: A8) => R8) | ((...p: A9) => R9) | ((...p: A10) => R10)
  : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; }
    ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6) | ((...p: A7) => R7) | ((...p: A8) => R8) | ((...p: A9) => R9)
    : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; }
      ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6) | ((...p: A7) => R7) | ((...p: A8) => R8)
      : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; }
        ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6) | ((...p: A7) => R7)
        : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; }
          ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5) | ((...p: A6) => R6)
          : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; }
            ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4) | ((...p: A5) => R5)
            : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; }
              ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3) | ((...p: A4) => R4)
              : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; }
                ? ((...p: A1) => R1) | ((...p: A2) => R2) | ((...p: A3) => R3)
                : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; }
                  ? ((...p: A1) => R1) | ((...p: A2) => R2)
                  : F extends (...args: infer A1) => infer R1 ? ((...p: A1) => R1)
                    : never

/**
 * Get a union of overload variants for a function `F`. Does a check for whether we can do the one-shot 10-overload matcher (which works for ts>5.3), and if not, falls back to the more complicated utility.
 */
export type OverloadsInfoUnion<F> =
  // recent TypeScript versions (5.3+) can treat a 1-overload type function as a 10-overload. Test for this by seeing if we can successfully get a union from a 1-overload function. If we can't, we're on an old TypeScript and need to use the more complicated utility.
  IsNever<TSPost53OverloadsInfoUnion<(a: 1) => 2>> extends true
    ? TSPre53OverloadsInfoUnion<F>
    : TSPost53OverloadsInfoUnion<F>

/** Allows inferring any function using the `infer` keyword */
export type InferFn<F extends (...args: any) => any> = F

/** A union type of the parameters allowed for any overload of function `F` */
export type OverloadParameters<F> = OverloadsInfoUnion<F> extends InferFn<infer Fn> ? Parameters<Fn> : never

/** A union type of the return types for any overload of function `F` */
export type OverloadReturnTypes<F> = OverloadsInfoUnion<F> extends InferFn<infer Fn> ? ReturnType<Fn> : never

/** Takes an overload variants `Union`, produced from {@linkcode OverloadsInfoUnion} and rejects the ones incompatible with parameters `A` */
export type SelectOverloadsInfo<Union extends UnknownFn, A extends unknown[]> =
  Union extends InferFn<infer Fn> ? (A extends Parameters<Fn> ? Fn : never) : never

// prettier-ignore
/** Gets the matching return type from a parameters-type (usually a overload variants union) */
export type OverloadReturnTypeForParameters<F, A extends unknown[]> =
  SelectOverloadsInfo<OverloadsInfoUnion<F>, A> extends InferFn<infer Fn> ? ReturnType<Fn> : never
