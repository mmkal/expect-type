import type {IsEmptyObject, EscapeProp, Props} from '../src'
import {expectTypeOf} from '../src'

expectTypeOf<EscapeProp<'a.b c["x-y"]'>>().toBeIdenticalTo<'a\\.b\\ c\\["x-y"\\]'>()

expectTypeOf<IsEmptyObject<{}>>().toBeIdenticalTo<true>()
expectTypeOf<IsEmptyObject<{a: 1}>>().toBeIdenticalTo<false>()
expectTypeOf<IsEmptyObject<() => 1>>().toBeIdenticalTo<false>()

export type t = Props<{x?: () => 1}>
expectTypeOf<Props<{x: 1}>>().toExtend<{'.x: literal number: 1': 0}>()
expectTypeOf<Props<{x?: 1}>>().toExtend<{'.x?: literal number: 1': 0}>()
expectTypeOf<Props<{x?: {readonly y?: 1}}>>().toExtend<{'.x?.y(readonly)?: literal number: 1': 0}>()
expectTypeOf<Props<{x?: () => 1}>>().toExtend<{
  '.x?: undefined': 0
  '.x?:args: []': 0
  '.x?:return: literal number: 1': 0
}>()
expectTypeOf<Props<{x: undefined | (() => 1)}>>().toExtend<{
  '.x: undefined': 0
  '.x:args: []': 0
  '.x:return: literal number: 1': 0
}>()
expectTypeOf<Props<{a: {b: 2}; 'a.b': 1}>>().toBeIdenticalTo<{
  '.a.b: literal number: 2': 0
  '.a\\.b: literal number: 1': 0
}>()
