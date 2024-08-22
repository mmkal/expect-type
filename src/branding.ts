import {ConstructorOverloadParameters, NumOverloads, OverloadsInfoUnion} from './overloads'
import {
  IsNever,
  IsAny,
  IsUnknown,
  ReadonlyKeys,
  RequiredKeys,
  OptionalKeys,
  MutuallyExtends,
  UnionToTuple,
  IsTuple,
  Not,
} from './utils'

export type DeepBrandOptions = {
  nominalTypes: {}
}

export type DeepBrandOptionsDefaults = {
  nominalTypes: {
    Date: Date
  }
}

export type NominalType<T, Options extends DeepBrandOptions> = Options['nominalTypes'] extends infer N
  ? {
      [K in keyof N]: MutuallyExtends<N[K], T> extends true ? K : never
    }[keyof N]
  : never

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
export type DeepBrand<T, Options extends DeepBrandOptions> =
  IsNever<T> extends true
    ? {type: 'never'}
    : IsAny<T> extends true
      ? {type: 'any'}
      : IsUnknown<T> extends true
        ? {type: 'unknown'}
        : Not<IsNever<NominalType<T, Options>>> extends true
          ? {type: NominalType<T, Options>}
          : T extends string | number | boolean | symbol | bigint | null | undefined | void
            ? {
                type: 'primitive'
                value: T
              }
            : T extends new (...args: any[]) => any
              ? {
                  type: 'constructor'
                  params: ConstructorOverloadParameters<T>
                  instance: DeepBrand<InstanceType<Extract<T, new (...args: any) => any>>, Options>
                }
              : T extends (...args: infer P) => infer R // avoid functions with different params/return values matching
                ? NumOverloads<T> extends 1
                  ? {
                      type: 'function'
                      params: DeepBrand<P, Options>
                      return: DeepBrand<R, Options>
                      this: DeepBrand<ThisParameterType<T>, Options>
                      props: DeepBrand<Omit<T, keyof Function>, Options>
                    }
                  : UnionToTuple<OverloadsInfoUnion<T>> extends infer OverloadsTuple
                    ? {
                        type: 'overloads'
                        overloads: {
                          [K in keyof OverloadsTuple]: DeepBrand<OverloadsTuple[K], Options>
                        }
                      }
                    : never
                : T extends any[]
                  ? IsTuple<T> extends true
                    ? {
                        type: 'tuple'
                        items: {
                          [K in keyof T]: DeepBrand<T[K], Options>
                        }
                      }
                    : {
                        type: 'array'
                        items: DeepBrand<T[number], Options>
                      }
                  : {
                      type: 'object'
                      properties: {
                        [K in keyof T]: DeepBrand<T[K], Options>
                      }
                      readonly: ReadonlyKeys<T>
                      required: RequiredKeys<T>
                      optional: OptionalKeys<T>
                      constructorParams: ConstructorOverloadParameters<T> extends infer P
                        ? IsNever<P> extends true
                          ? never
                          : DeepBrand<P, Options>
                        : never
                    }

/**
 * Checks if two types are strictly equal using branding.
 */
export type StrictEqualUsingBranding<Left, Right, Options extends DeepBrandOptions> = MutuallyExtends<
  DeepBrand<Left, Options>,
  DeepBrand<Right, Options>
>

type tt = DeepBrand<{d: Date}, DeepBrandOptionsDefaults>

type tn = NominalType<{d: Date}, DeepBrandOptionsDefaults> // extends string ? [] : 1
