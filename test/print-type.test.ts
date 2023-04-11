import type {IsEmptyObject, EscapeProp, Props} from '../src'
import {expectTypeOf} from '../src'

expectTypeOf<EscapeProp<'a.b c["x-y"]'>>().toBeIdenticalTo<'a\\.b\\ c\\["x-y"\\]'>()

expectTypeOf<IsEmptyObject<{}>>().toBeIdenticalTo<true>()
expectTypeOf<IsEmptyObject<{a: 1}>>().toBeIdenticalTo<false>()
expectTypeOf<IsEmptyObject<Record<string, unknown>>>().toBeIdenticalTo<false>()
expectTypeOf<IsEmptyObject<() => 1>>().toBeIdenticalTo<false>()

expectTypeOf<Props<{x: 1}>>().toExtend<{
  '.x': 'literal number: 1'
}>()

expectTypeOf<Props<{x: 1; y: 2}>>().toExtend<{
  '.x': 'literal number: 1'
  '.y': 'literal number: 2'
}>()

expectTypeOf<Props<{x?: 1}>>().toExtend<{
  '.x?': 'undefined' | 'literal number: 1'
}>()

expectTypeOf<Props<{x?: {readonly y?: 1}}>>().toExtend<{
  '.x?': 'undefined'
  '.x?.y(readonly)?': 'undefined' | 'literal number: 1'
}>()

expectTypeOf<Props<{x?: () => 1}>>().toExtend<{
  '.x?': 'undefined'
  '.x?:args': '[]'
  '.x?:return': 'literal number: 1'
}>()

expectTypeOf<Props<{x: undefined | (() => 1)}>>().toExtend<{
  '.x': 'undefined'
  '.x:args': '[]'
  '.x:return': 'literal number: 1'
}>()

expectTypeOf<Props<{a: {b: 2}; 'a.b': 1}>>().toBeIdenticalTo<{
  '.a.b': 'literal number: 2'
  '.a\\.b': 'literal number: 1'
}>()
