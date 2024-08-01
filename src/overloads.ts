import {StrictEqualUsingTSInternalIdenticalToOperator, IsNever} from './utils'

// prettier-ignore
/**
 * The simple(ish) way to get overload info from a function `F`. Recent versions of typescript will match any function against a generic 10-overload type, filling in slots with duplicates of the function.
 * So, we can just match against a single type and get all the overloads.
 *
 * For older versions of typescript, we'll need to painstakingly do ten separate matches.
 */
export type TSPost53OverloadsInfoTuple<F> =
  F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; (...args: infer A10): infer R10}
  ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, {parameters: A8; return: R8}, {parameters: A9; return: R9}, {parameters: A10; return: R10}, ]
  : never

export type BaseOverloadInfo = {parameters: unknown[]; return: unknown}

/**
 * `true` iff `T` is equivalent to `{parameters: unknown[]; return: unknown}`, which is what an overload info object looks like for a non-existent overload
 * This is useful because older versions of typescript end up with 9 "useless" overloads and one real one for parameterless/generic functions
 */
export type IsUselessOverloadInfo<T> = StrictEqualUsingTSInternalIdenticalToOperator<T, BaseOverloadInfo>

// prettier-ignore
/**
 * For older versions of typescript, we need two separate workarounds to get overload info.
 * First, we need need to use {@linkcode DecreasingOverloadsInfoTuple} to get the overload info for functions with 1-10 overloads.
 * Then, we need to filter out the "useless" overloads that are present in older versions of typescript, for parameterless functions.
 * To do this we check if `F` is parameterless, then use {@linkcode IsUselessOverloadInfo} to replace useless overloads with the parameterless overload.
 */
export type TSPre53OverloadsInfoTuple<F> = F extends (...args: infer A) => infer R
  ? DecreasingOverloadsInfoTuple<F> extends infer T
    ? Extract<
        {
          [K in keyof T]:
            IsUselessOverloadInfo<T[K]> extends true
              ? {parameters: A; return: R}
              : T[K]
        },
        Array<{parameters: unknown[]; return: unknown}>
      >
    : never
  : DecreasingOverloadsInfoTuple<F>

// prettier-ignore
/**
 * For versions of typescript below 5.3, we need to check for 10 overloads, then 9, then 8, etc., to get a tuple of the overlaod info objects.
 */
export type DecreasingOverloadsInfoTuple<F> = F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; (...args: infer A10): infer R10}
  ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, {parameters: A8; return: R8}, {parameters: A9; return: R9}, {parameters: A10; return: R10}, ]
  : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; }
    ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, {parameters: A8; return: R8}, {parameters: A9; return: R9}, ]
    : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; }
      ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, {parameters: A8; return: R8}, ]
      : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; }
        ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, ]
        : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; }
          ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, ]
          : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; }
            ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, ]
            : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; }
              ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, ]
              : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; }
                ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}]
                : F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; }
                  ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}]
                  : F extends (...args: infer A1) => infer R1 ? [{parameters: A1; return: R1}]
                    : never

/**
 * Get a tuple of overload info objects for a function `F`. Does a check for whether we can do the one-shot 10-overload matcher (which works for ts>5.3), and if not, falls back to the more complicated utility.
 */
export type OverloadsInfoTuple<F> =
  // recent typescript versions (5.3+) can treat a 1-overload type function as a 10-overload. Test for this by seeing if we can successfully get a 10-tuple from a 1-overload function. If we can't, we're on an old typescript and need to use the more complicated utility.
  IsNever<TSPost53OverloadsInfoTuple<(a: 1) => 2>> extends true
    ? TSPre53OverloadsInfoTuple<F>
    : TSPost53OverloadsInfoTuple<F>

/** A union type of the parameters allowed for any overload of function `F` */
export type OverloadParameters<F> = OverloadsInfoTuple<F>[number]['parameters']
/** A union type of the return types for any overload of function `F` */
export type OverloadReturnTypes<F> = OverloadsInfoTuple<F>[number]['return']

/** Takes an overloads info `Tuple`, produced from {@linkcode OverloadsInfoTuple} and rejects the ones incompatible with `A` */
export type SelectOverloadsInfo<Tuple extends BaseOverloadInfo[], A extends unknown[]> = {
  [K in keyof Tuple]: A extends Tuple[K]['parameters'] ? Tuple[K] : never
}

// prettier-ignore
/** Gets the matching return type from a parameters-type (usually a tuple) */
export type OverloadReturnTypeForParameters<F, A extends unknown[]> =
  SelectOverloadsInfo<OverloadsInfoTuple<F>, A>[number]['return']
