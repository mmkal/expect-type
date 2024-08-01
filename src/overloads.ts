/* eslint-disable prettier/prettier */
import {StrictEqualUsingTSInternalIdenticalToOperator, IsNever} from '.'

export type TSPost53OverloadsInfoTuple<F> = F extends {(...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; (...args: infer A5): infer R5; (...args: infer A6): infer R6; (...args: infer A7): infer R7; (...args: infer A8): infer R8; (...args: infer A9): infer R9; (...args: infer A10): infer R10
}
  ? [{parameters: A1; return: R1}, {parameters: A2; return: R2}, {parameters: A3; return: R3}, {parameters: A4; return: R4}, {parameters: A5; return: R5}, {parameters: A6; return: R6}, {parameters: A7; return: R7}, {parameters: A8; return: R8}, {parameters: A9; return: R9}, {parameters: A10; return: R10}, ]
  : never

export type IsUselessOverloadInfo<T> = StrictEqualUsingTSInternalIdenticalToOperator<T, {parameters: unknown[]; return: unknown}>

export type TSPre53OverloadsInfoTuple<F> = F extends () => infer R
  ? DecreasingOverloadsInfoTuple<F> extends infer T
    ? Extract<
        {
          [K in keyof T]:
            IsUselessOverloadInfo<T[K]> extends true
              ? {parameters: []; return: R}
              : T[K]
        },
        Array<{parameters: unknown[]; return: unknown}>
      >
    : never
  : DecreasingOverloadsInfoTuple<F>

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

export type OverloadsInfoTuple<F> =
  // recent typescript versions (5.3+) can treat a 1-overload type function as a 10-overload. Test for this by seeing if we can successfully get a 10-tuple from a 1-overload function. If we can't, we're on an old typescript and need to use the more complicated utility.
  IsNever<TSPost53OverloadsInfoTuple<(a: 1) => 2>> extends true
    ? TSPre53OverloadsInfoTuple<F>
    : TSPost53OverloadsInfoTuple<F>

export type OverloadParameters<F> = OverloadsInfoTuple<F>[number]['parameters']
export type OverloadReturnTypes<F> = OverloadsInfoTuple<F>[number]['return']
