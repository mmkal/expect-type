// import type {Or, IsAny, IsUnknown, IsNever, OptionalKeys, ReadonlyKeys, PrintType} from '../src'

// type RealUnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
// type UnionToIntersection<T> = T // (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

// type TypeRecordInner<T, Record = {}, Path extends string = ''> = Or<[IsAny<T>, IsUnknown<T>, IsNever<T>]> extends true
//   ? Record & {[K in Path]: IsAny<T> extends true ? 'any' : PrintType<T>}
//   : T extends string | number | boolean | null | undefined | readonly []
//   ? Record & {[K in Path]: PrintType<T>}
//   : T extends [any, ...any[]] // 0-length tuples handled above, 1-or-more element tuples handled separately from arrays
//   ? UnionToIntersection<
//       {
//         [K in keyof T]: TypeRecordInner<T[K], Record, `${Path}[${Extract<K, Digit>}]`>
//       }[Extract<keyof T, Digit> | number]
//     >
//   : T extends readonly [any, ...any[]] // 0-length tuples handled above, 1-or-more element tuples handled separately from arrays
//   ? UnionToIntersection<
//       {
//         [K in keyof T]: TypeRecordInner<T[K], Record, `${Path}[${Extract<K, Digit>}](readonly)`>
//       }[Extract<keyof T, Digit> | number]
//     >
//   : T extends Array<infer X>
//   ? TypeRecordInner<X, Record, `${Path}[]`>
//   : T extends (...args: infer Args) => infer Return
//   ? TypeRecordInner<Args, Record, `${Path}:args`> &
//       TypeRecordInner<Return, Record, `${Path}:return`> &
//       TypeRecordInner<Omit<T, keyof Function>, Record, Path> // pick up properties of "augmented" functions e.g. the `foo` of `Object.assign(() => 1, {foo: 'bar'})`
//   : // prettier-ignore
//     RUTI<NonNullable<{[K in keyof T]: TypeRecordInner<T[K], Record, `${Path}.${Extract<K, string | number>}${K extends ReadonlyKeys<T>
//       ? '(readonly)'
//       : ''}${K extends OptionalKeys<T> ? '?' : ''}`>}> >
// // UnionToIntersection< {[K in keyof T]: 111}[keyof T]>
// type x = 1 extends 1
//   ? 1
//   : UnionToIntersection<
//       {
//         [K in keyof T]: TypeRecordInner<
//           T[K],
//           Record,
//           `${Path}.${Extract<K, string | number>}${K extends ReadonlyKeys<T>
//             ? '(readonly)'
//             : ''}${K extends OptionalKeys<T> ? '?' : ''}`
//         >
//       }[keyof T]
//     >

// type obj = {
//   deeply: {
//     nested: {
//       empty: []
//       one: ['a']
//       const: readonly [1]
//       two: ['a', 'b']
//       arr: string[]
//       value: number
//       str: string
//       fn: (x: 1) => number
//       fn2: () => number
//       augmented: ((x: 1, y: 2) => number) & {abc: 123}
//       null: null
//       undefined: undefined
//       any: any
//       never: never
//       unknown: unknown
//       partialish: {a: 1; b: 2}
//     }
//     other: {
//       val: 1
//     }
//   }
// }

// type TypeRecord<T> = {
//   [K in keyof TypeRecordInner<T>]: TypeRecordInner<T>[K]
// }

// type tt = TypeRecord<obj>
// type t2 = TypeRecord<{a?: 1; b?: 1}>
// type t3 = TypeRecord<'a' | undefined>

// type u = {
//   a?:
//     | {
//         '.a?': 'undefined'
//       }
//     | {
//         '.a?': 'literal number: 1'
//       }
//     | undefined
//   b?:
//     | {
//         '.b?': 'undefined'
//       }
//     | {
//         '.b?': 'literal number: 1'
//       }
//     | undefined
// }
// type MergyThingKeys<T> = NonNullable<
//   {
//     [K in keyof NonNullable<T>]: NonNullable<K>
//   }[keyof NonNullable<T>]
// >

// type u2 = NonNullable<u[keyof u]>
// type k = keyof u
// type x = NonNullable<
//   {
//     [K in keyof u]: NonNullable<K>
//   }[keyof u]
// >
// type x2 = MergyThingKeys<u>
// type x3 = RealUnionToIntersection<
//   {
//     [K in MergyThingKeys<u>]: {
//       [J in keyof NonNullable<u[K]>]: NonNullable<u[K]>[J]
//     }
//   }[MergyThingKeys<u>]
// >

// type RUTI<U> = RealUnionToIntersection<
//   {
//     [K in MergyThingKeys<U>]: {
//       [J in keyof NonNullable<U[K]>]: NonNullable<U[K]>[J]
//     }
//   }[MergyThingKeys<U>]
// >
// type v = NonNullable<u['a']>['.a?']
