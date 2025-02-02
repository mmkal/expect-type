import * as fs from 'node:fs'
import * as path from 'node:path'
import {test, expect} from 'vitest'
import {tsFileErrors} from './ts-output'

test.each(['usage.test.ts', 'types.test.ts'])('%s: toMatchTypeOf matches toExtend behaviour', file => {
  const filepath = path.join(__dirname, file)
  const content = fs.readFileSync(filepath, 'utf8')
  const updated = content.replaceAll('.toExtend', '.toMatchTypeOf')
  expect(tsFileErrors({filepath: path.join(filepath), content: updated})).toBe('')
})
