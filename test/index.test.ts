/* eslint-disable mmkal/@typescript-eslint/no-empty-function */
/* eslint-disable mmkal/@typescript-eslint/ban-ts-comment */
import {expectTypeOf} from '../src'

/* eslint mmkal/prettier/prettier: ["warn", { "singleQuote": true, "semi": false, "arrowParens": "avoid", "trailingComma": "es5", "bracketSpacing": false, "endOfLine": "auto", "printWidth": 100 }] */

test("Check an object's type with `.toEqualTypeOf`", () => {
  expectTypeOf({a: 1}).toEqualTypeOf<{a: number}>()
})

test('`.toEqualTypeOf` can check that two concrete objects have equivalent types', () => {
  expectTypeOf({a: 1}).toEqualTypeOf({a: 1})
})

test('`.toEqualTypeOf` succeeds for objects with different values, but the same type', () => {
  expectTypeOf({a: 1}).toEqualTypeOf({a: 2})
})

test('`.toEqualTypeOf` fails on extra properties', () => {
  // @ts-expect-error
  expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
})

test('To allow for extra properties, use `.toMatchTypeOf`. This checks that an object "matches" a type. This is similar to jest\'s `.toMatchObject`', () => {
  expectTypeOf({a: 1, b: 1}).toMatchTypeOf({a: 1})
})

test('Another example of the difference between `.toMatchTypeOf` and `.toEqualTypeOf`, using generics. `.toMatchTypeOf` can be used for "is-a" relationships', () => {
  type Fruit = {type: 'Fruit'; edible: boolean}
  type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}

  expectTypeOf<Apple>().toMatchTypeOf<Fruit>()

  // @ts-expect-error
  expectTypeOf<Fruit>().toMatchTypeOf<Apple>()

  // @ts-expect-error
  expectTypeOf<Apple>().toEqualTypeOf<Fruit>()
})

test('Assertions can be inverted with `.not`', () => {
  expectTypeOf({a: 1}).not.toMatchTypeOf({b: 1})
})

test('`.not` can be easier than relying on `// @ts-expect-error`', () => {
  type Fruit = {type: 'Fruit'; edible: boolean}
  type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}

  expectTypeOf<Apple>().toMatchTypeOf<Fruit>()

  expectTypeOf<Fruit>().not.toMatchTypeOf<Apple>()
  expectTypeOf<Apple>().not.toEqualTypeOf<Fruit>()
})

test('Catch any/unknown/never types', () => {
  expectTypeOf<unknown>().toBeUnknown()
  expectTypeOf<any>().toBeAny()
  expectTypeOf<never>().toBeNever()

  // @ts-expect-error
  expectTypeOf<never>().toBeNumber()
})

test('`.toEqualTypeOf` distinguishes between deeply-nested `any` and `unknown` properties', () => {
  expectTypeOf<{deeply: {nested: any}}>().not.toEqualTypeOf<{deeply: {nested: unknown}}>()
})

// eslint-disable-next-line mmkal/jest/valid-title
test('Test for basic javascript types', () => {
  expectTypeOf(() => 1).toBeFunction()
  expectTypeOf({}).toBeObject()
  expectTypeOf([]).toBeArray()
  expectTypeOf('').toBeString()
  expectTypeOf(1).toBeNumber()
  expectTypeOf(true).toBeBoolean()
  expectTypeOf(() => {}).returns.toBeVoid()
  expectTypeOf(Promise.resolve(123)).resolves.toBeNumber()
  expectTypeOf(Symbol(1)).toBeSymbol()
})

test('Nullable types', () => {
  expectTypeOf(undefined).toBeUndefined()
  expectTypeOf(undefined).toBeNullable()
  expectTypeOf(undefined).not.toBeNull()

  expectTypeOf(null).toBeNull()
  expectTypeOf(null).toBeNullable()
  expectTypeOf(null).not.toBeUndefined()

  expectTypeOf<1 | undefined>().toBeNullable()
  expectTypeOf<1 | null>().toBeNullable()
  expectTypeOf<1 | undefined | null>().toBeNullable()
})

test('More `.not` examples', () => {
  expectTypeOf(1).not.toBeUnknown()
  expectTypeOf(1).not.toBeAny()
  expectTypeOf(1).not.toBeNever()
  expectTypeOf(1).not.toBeNull()
  expectTypeOf(1).not.toBeUndefined()
  expectTypeOf(1).not.toBeNullable()
})

test('Detect assignability of unioned types', () => {
  expectTypeOf<number>().toMatchTypeOf<string | number>()
  expectTypeOf<string | number>().not.toMatchTypeOf<number>()
})

test('Use `.extract` and `.exclude` to narrow down complex union types', () => {
  type ResponsiveProp<T> = T | T[] | {xs?: T; sm?: T; md?: T}
  const getResponsiveProp = <T>(_props: T): ResponsiveProp<T> => ({})
  type CSSProperties = {margin?: string; padding?: string}

  const cssProperties: CSSProperties = {margin: '1px', padding: '2px'}

  expectTypeOf(getResponsiveProp(cssProperties))
    .exclude<unknown[]>()
    .exclude<{xs?: unknown}>()
    .toEqualTypeOf<CSSProperties>()

  expectTypeOf(getResponsiveProp(cssProperties))
    .extract<unknown[]>()
    .toEqualTypeOf<CSSProperties[]>()

  expectTypeOf(getResponsiveProp(cssProperties))
    .extract<{xs?: any}>()
    .toEqualTypeOf<{xs?: CSSProperties; sm?: CSSProperties; md?: CSSProperties}>()

  expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('sm')
  expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().not.toHaveProperty('xxl')
})

test('`.extract` and `.exclude` return never if no types remain after exclusion', () => {
  type Person = {name: string; age: number}
  type Customer = Person & {customerId: string}
  type Employee = Person & {employeeId: string}

  expectTypeOf<Customer | Employee>().extract<{foo: string}>().toBeNever()
  expectTypeOf<Customer | Employee>().exclude<{name: string}>().toBeNever()
})

test('Make assertions about object properties', () => {
  const obj = {a: 1, b: ''}

  // check that properties exist (or don't) with `.toHaveProperty`
  expectTypeOf(obj).toHaveProperty('a')
  expectTypeOf(obj).not.toHaveProperty('c')

  // check types of properties
  expectTypeOf(obj).toHaveProperty('a').toBeNumber()
  expectTypeOf(obj).toHaveProperty('b').toBeString()
  expectTypeOf(obj).toHaveProperty('a').not.toBeString()
})

test('`.toEqualTypeOf` can be used to distinguish between functions', () => {
  type NoParam = () => void
  type HasParam = (s: string) => void

  expectTypeOf<NoParam>().not.toEqualTypeOf<HasParam>()
})

test("But often it's preferable to use `.parameters` or `.returns` for more specific function assertions", () => {
  type NoParam = () => void
  type HasParam = (s: string) => void

  expectTypeOf<NoParam>().parameters.toEqualTypeOf<[]>()
  expectTypeOf<NoParam>().returns.toBeVoid()

  expectTypeOf<HasParam>().parameters.toEqualTypeOf<[string]>()
  expectTypeOf<HasParam>().returns.toBeVoid()
})

test('More examples of ways to work with functions - parameters using `.parameter(n)` or `.parameters`, and return values using `.returns`', () => {
  const f = (a: number) => [a, a]

  expectTypeOf(f).toBeFunction()

  expectTypeOf(f).toBeCallableWith(1)
  expectTypeOf(f).not.toBeAny()
  expectTypeOf(f).returns.not.toBeAny()
  expectTypeOf(f).returns.toEqualTypeOf([1, 2])
  expectTypeOf(f).returns.toEqualTypeOf([1, 2, 3])
  expectTypeOf(f).parameter(0).not.toEqualTypeOf('1')
  expectTypeOf(f).parameter(0).toEqualTypeOf(1)
  expectTypeOf(1).parameter(0).toBeNever()

  const twoArgFunc = (a: number, b: string) => ({a, b})

  expectTypeOf(twoArgFunc).parameters.toEqualTypeOf<[number, string]>()
})

test('You can also check type guards & type assertions', () => {
  const assertNumber = (v: any): asserts v is number => {
    if (typeof v !== 'number') {
      throw new TypeError('Nope !')
    }
  }

  expectTypeOf(assertNumber).asserts.toBeNumber()

  const isString = (v: any): v is string => typeof v === 'string'
  expectTypeOf(isString).guards.toBeString()
})

test('Assert on constructor parameters', () => {
  expectTypeOf(Date).toBeConstructibleWith('1970')
  expectTypeOf(Date).toBeConstructibleWith(0)
  expectTypeOf(Date).toBeConstructibleWith(new Date())
  expectTypeOf(Date).toBeConstructibleWith()

  expectTypeOf(Date).constructorParameters.toEqualTypeOf<[] | [string | number | Date]>()
})

test('Check function `this` parameters', () => {
  function greet(this: {name: string}, message: string) {
    return `Hello ${this.name}, here's your message: ${message}`
  }

  expectTypeOf(greet).thisParameter.toEqualTypeOf<{name: string}>()
})

test('Distinguish between functions with different `this` parameters', () => {
  function greetFormal(this: {title: string; name: string}, message: string) {
    return `Dear ${this.title} ${this.name}, here's your message: ${message}`
  }

  function greetCasual(this: {name: string}, message: string) {
    return `Hi ${this.name}, here's your message: ${message}`
  }

  expectTypeOf(greetFormal).not.toEqualTypeOf(greetCasual)
})

test('Class instance types', () => {
  expectTypeOf(Date).instance.toHaveProperty('toISOString')
})

test('Promise resolution types can be checked with `.resolves`', () => {
  const asyncFunc = async () => 123

  expectTypeOf(asyncFunc).returns.resolves.toBeNumber()
})

test('Array items can be checked with `.items`', () => {
  expectTypeOf([1, 2, 3]).items.toBeNumber()
  expectTypeOf([1, 2, 3]).items.not.toBeString()
})

test('Check that functions never return', () => {
  const thrower = () => {
    throw new Error('oh no')
  }

  expectTypeOf(thrower).returns.toBeNever()
})

test('Generics can be used rather than references', () => {
  expectTypeOf<{a: string}>().not.toEqualTypeOf<{a: number}>()
})

test('Distinguish between missing/null/optional properties', () => {
  expectTypeOf<{a?: number}>().not.toEqualTypeOf<{}>()
  expectTypeOf<{a?: number}>().not.toEqualTypeOf<{a: number}>()
  expectTypeOf<{a?: number}>().not.toEqualTypeOf<{a: number | undefined}>()
  expectTypeOf<{a?: number | null}>().not.toEqualTypeOf<{a: number | null}>()
  expectTypeOf<{a: {b?: number}}>().not.toEqualTypeOf<{a: {}}>()
})

test('Detect the difference between regular and readonly properties', () => {
  type A1 = {readonly a: string; b: string}
  type E1 = {a: string; b: string}

  expectTypeOf<A1>().toMatchTypeOf<E1>()
  expectTypeOf<A1>().not.toEqualTypeOf<E1>()

  type A2 = {a: string; b: {readonly c: string}}
  type E2 = {a: string; b: {c: string}}

  expectTypeOf<A2>().toMatchTypeOf<E2>()
  expectTypeOf<A2>().not.toEqualTypeOf<E2>()
})

test('Distinguish between classes with different constructors', () => {
  class A {
    value: number
    constructor(a: 1) {
      this.value = a
    }
  }
  class B {
    value: number
    constructor(b: 2) {
      this.value = b
    }
  }

  expectTypeOf<typeof A>().not.toEqualTypeOf<typeof B>()

  class C {
    value: number
    constructor(c: 1) {
      this.value = c
    }
  }

  expectTypeOf<typeof A>().toEqualTypeOf<typeof C>()
})
