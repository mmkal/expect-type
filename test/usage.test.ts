/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {test} from 'vitest'
import {expectTypeOf} from '../src'

/* eslint prettier/prettier: ["warn", { "singleQuote": true, "semi": false, "arrowParens": "avoid", "trailingComma": "es5", "bracketSpacing": false, "endOfLine": "auto", "printWidth": 100 }] */

test("Check an object's type with `.toEqualTypeOf`", () => {
  expectTypeOf({a: 1}).toEqualTypeOf<{a: number}>()
})

test('`.toEqualTypeOf` can check that two concrete objects have equivalent types (note: when these assertions _fail_, the error messages can be less informative vs the generic typearg syntax above - see [error messages docs](#error-messages))', () => {
  expectTypeOf({a: 1}).toEqualTypeOf({a: 1})
})

test('`.toEqualTypeOf` succeeds for objects with different values, but the same type', () => {
  expectTypeOf({a: 1}).toEqualTypeOf({a: 2})
})

test('`.toEqualTypeOf` fails on extra properties', () => {
  // @ts-expect-error
  expectTypeOf({a: 1, b: 1}).toEqualTypeOf<{a: number}>()
})

test('To allow for extra properties, use `.toMatchTypeOf`. This is roughly equivalent to an `extends` constraint in a function type argument.', () => {
  expectTypeOf({a: 1, b: 1}).toMatchTypeOf<{a: number}>()
})

test('`.toEqualTypeOf` and `.toMatchTypeOf` both fail on missing properties', () => {
  // @ts-expect-error
  expectTypeOf({a: 1}).toEqualTypeOf<{a: number; b: number}>()
  // @ts-expect-error
  expectTypeOf({a: 1}).toMatchTypeOf<{a: number; b: number}>()
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

// eslint-disable-next-line vitest/valid-title
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

test('`.toBe...` methods allow for types which extend the expected type', () => {
  expectTypeOf<number>().toBeNumber()
  expectTypeOf<1>().toBeNumber()

  expectTypeOf<any[]>().toBeArray()
  expectTypeOf<number[]>().toBeArray()

  expectTypeOf<string>().toBeString()
  expectTypeOf<'foo'>().toBeString()

  expectTypeOf<boolean>().toBeBoolean()
  expectTypeOf<true>().toBeBoolean()
})

test('`.toBe...` methods protect against `any`', () => {
  const goodIntParser = (s: string) => Number.parseInt(s, 10)
  const badIntParser = (s: string) => JSON.parse(s) // uh-oh - works at runtime if the input is a number, but return 'any'

  expectTypeOf(goodIntParser).returns.toBeNumber()
  // @ts-expect-error - if you write a test like this, `.toBeNumber()` will let you know your implementation returns `any`.
  expectTypeOf(badIntParser).returns.toBeNumber()
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

test('Use `.pick` to pick a set of properties from an object', () => {
  type Person = {name: string; age: number}

  expectTypeOf<Person>().pick<'name'>().toEqualTypeOf<{name: string}>()
})

test('Use `.omit` to remove a set of properties from an object', () => {
  type Person = {name: string; age: number}

  expectTypeOf<Person>().omit<'name'>().toEqualTypeOf<{age: number}>()
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

test("You can't use `.toBeCallableWith` with `.not` - you need to use ts-expect-error:", () => {
  const f = (a: number) => [a, a]

  // @ts-expect-error
  expectTypeOf(f).toBeCallableWith('foo')
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

test('You can also compare arrays directly', () => {
  expectTypeOf<any[]>().not.toEqualTypeOf<number[]>()
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

test('Known limitation: Intersection types can cause issues with `toEqualTypeOf`', () => {
  // @ts-expect-error the following line doesn't compile, even though the types are arguably the same.
  // See https://github.com/mmkal/expect-type/pull/21
  expectTypeOf<{a: 1} & {b: 2}>().toEqualTypeOf<{a: 1; b: 2}>()
})

test('To workaround for simple cases, you can use a mapped type', () => {
  type Simplify<T> = {[K in keyof T]: T[K]}

  expectTypeOf<Simplify<{a: 1} & {b: 2}>>().toEqualTypeOf<{a: 1; b: 2}>()
})

test("But this won't work if the nesting is deeper in the type. For these situations, you can use the `.branded` helper. Note that this comes at a performance cost, and can cause the compiler to 'give up' if used with excessively deep types, so use sparingly. This helper is under `.branded` because it depply transforms the Actual and Expected types into a pseudo-AST", () => {
  // @ts-expect-error
  expectTypeOf<{a: {b: 1} & {c: 1}}>().toEqualTypeOf<{a: {b: 1; c: 1}}>()

  expectTypeOf<{a: {b: 1} & {c: 1}}>().branded.toEqualTypeOf<{a: {b: 1; c: 1}}>()
})

test('Be careful with `.branded` for very deep or complex types, though. If possible you should find a way to simplify your test to avoid needing to use it', () => {
  // This *should* result in an error, but the "branding" mechanism produces too large a type and TypeScript just gives up! https://github.com/microsoft/TypeScript/issues/50670
  expectTypeOf<() => () => () => () => 1>().branded.toEqualTypeOf<() => () => () => () => 2>()

  // @ts-expect-error the non-branded implementation catches the error as expected.
  expectTypeOf<() => () => () => () => 1>().toEqualTypeOf<() => () => () => () => 2>()
})

test("So, if you have an extremely deep type which ALSO has an intersection in it, you're out of luck and this library won't be able to test your type properly", () => {
  // @ts-expect-error this fails, but it should succeed.
  expectTypeOf<() => () => () => () => {a: 1} & {b: 2}>().toEqualTypeOf<
    () => () => () => () => {a: 1; b: 2}
  >()

  // this succeeds, but it should fail.
  expectTypeOf<() => () => () => () => {a: 1} & {b: 2}>().branded.toEqualTypeOf<
    () => () => () => () => {a: 1; c: 2}
  >()
})

test('Another limitation: passing `this` references to `expectTypeOf` results in errors.', () => {
  class B {
    b = 'b'

    foo() {
      // @ts-expect-error
      expectTypeOf(this).toEqualTypeOf(this)
      // @ts-expect-error
      expectTypeOf(this).toMatchTypeOf(this)
    }
  }

  // Instead of the above, try something like this:
  expectTypeOf(B).instance.toEqualTypeOf<{b: string; foo: () => void}>()
})
