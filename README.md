# expect-type

[![CI](https://github.com/mmkal/expect-type/actions/workflows/ci.yml/badge.svg)](https://github.com/mmkal/expect-type/actions/workflows/ci.yml)
[![](https://byob.yarr.is/mmkal/expect-type/coverage)](https://github.com/mmkal/expect-type/actions/workflows/ci.yml)
![npm](https://img.shields.io/npm/dt/expect-type)

Compile-time tests for types. Useful to make sure types don't regress into being overly-permissive as changes go in over time.

Similar to Jest's `expect`, but with type-awareness. Gives you access to a number of type-matchers that let you make assertions about the form of a reference or generic type parameter.

```typescript
import {foo, bar} from '../foo'
import {expectTypeOf} from 'expect-type'

test('foo types', () => {
  // make sure `foo` has type {a: number}
  expectTypeOf(foo).toMatchTypeOf<{a: number}>()

  // make sure `bar` is a function taking a string:
  expectTypeOf(bar).parameter(0).toBeString()
  expectTypeOf(bar).returns.not.toBeAny()
})
```

It can be used in your existing test files - or any other type-checked file you'd like - it's built into existing tooling with no dependencies. No extra build step, cli tool, IDE extension, or lint plugin is needed. Just import the function and start writing tests. Failures will be at compile time - they'll appear in your IDE and when you run `tsc`.

See below for lots more examples.

## Contents
<!-- codegen:start {preset: markdownTOC, minDepth: 2, maxDepth: 5} -->
- [Contents](#contents)
- [Installation and usage](#installation-and-usage)
- [Documentation](#documentation)
   - [Features](#features)
   - [Within test frameworks](#within-test-frameworks)
      - [Jest & `eslint-plugin-jest`](#jest--eslint-plugin-jest)
- [Similar projects](#similar-projects)
   - [Comparison](#comparison)
- [Contributing](#contributing)
<!-- codegen:end -->

## Installation and usage

```cli
npm install expect-type
```

```typescript
import {expectTypeOf} from 'expect-type'
```

## Documentation

The `expectTypeOf` method takes a single argument, or a generic parameter. Neither it, nor the functions chained off its return value, have any meaningful runtime behaviour. The assertions you write will be _compile-time_ errors if they don't hold true.

### Features

<!-- codegen:start {preset: markdownFromTests, source: test/usage.test.ts} -->
Check an object's type with `.toBeIdenticalTo`:

```typescript
expectTypeOf({a: 1}).toBeIdenticalTo<{a: number}>()
```

`.toBeIdenticalTo` fails on extra properties:

```typescript
// @ts-expect-error
expectTypeOf({a: 1, b: 1}).toBeIdenticalTo<{a: number}>()
```

To allow for extra properties, use `.toExtend`. This checks that an object "matches" a type. This is similar to jest's `.toMatchObject`:

```typescript
expectTypeOf({a: 1, b: 1}).toExtend<{a: number}>()
```

`.toBeIdenticalTo` and `.toExtend` both fail on missing properties:

```typescript
// @ts-expect-error
expectTypeOf({a: 1}).toBeIdenticalTo<{a: number; b: number}>()
// @ts-expect-error
expectTypeOf({a: 1}).toExtend<{a: number; b: number}>()
```

Another example of the difference between `.toExtend` and `.toBeIdenticalTo`, using generics. `.toExtend` can be used for "is-a" relationships:

```typescript
type Fruit = {type: 'Fruit'; edible: boolean}
type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}

expectTypeOf<Apple>().toExtend<Fruit>()

// @ts-expect-error
expectTypeOf<Fruit>().toExtend<Apple>()

// @ts-expect-error
expectTypeOf<Apple>().toBeIdenticalTo<Fruit>()
```

Assertions can be inverted with `.not`:

```typescript
expectTypeOf({a: 1}).not.toExtend<{b: number}>()
```

`.not` can be easier than relying on `// @ts-expect-error`:

```typescript
type Fruit = {type: 'Fruit'; edible: boolean}
type Apple = {type: 'Fruit'; name: 'Apple'; edible: true}

expectTypeOf<Apple>().toExtend<Fruit>()

expectTypeOf<Fruit>().not.toExtend<Apple>()
expectTypeOf<Apple>().not.toBeIdenticalTo<Fruit>()
```

Catch any/unknown/never types:

```typescript
expectTypeOf<unknown>().toBeUnknown()
expectTypeOf<any>().toBeAny()
expectTypeOf<never>().toBeNever()

// @ts-expect-error
expectTypeOf<never>().toBeNumber()
```

`.toBeIdenticalTo` distinguishes between deeply-nested `any` and `unknown` properties:

```typescript
expectTypeOf<{deeply: {nested: any}}>().not.toBeIdenticalTo<{deeply: {nested: unknown}}>()
```

Test for basic javascript types:

```typescript
expectTypeOf(() => 1).toBeFunction()
expectTypeOf({}).toBeObject()
expectTypeOf([]).toBeArray()
expectTypeOf('').toBeString()
expectTypeOf(1).toBeNumber()
expectTypeOf(true).toBeBoolean()
expectTypeOf(() => {}).returns.toBeVoid()
expectTypeOf(Promise.resolve(123)).resolves.toBeNumber()
expectTypeOf(Symbol(1)).toBeSymbol()
```

Nullable types:

```typescript
expectTypeOf(undefined).toBeUndefined()
expectTypeOf(undefined).toBeNullable()
expectTypeOf(undefined).not.toBeNull()

expectTypeOf(null).toBeNull()
expectTypeOf(null).toBeNullable()
expectTypeOf(null).not.toBeUndefined()

expectTypeOf<1 | undefined>().toBeNullable()
expectTypeOf<1 | null>().toBeNullable()
expectTypeOf<1 | undefined | null>().toBeNullable()
```

More `.not` examples:

```typescript
expectTypeOf(1).not.toBeUnknown()
expectTypeOf(1).not.toBeAny()
expectTypeOf(1).not.toBeNever()
expectTypeOf(1).not.toBeNull()
expectTypeOf(1).not.toBeUndefined()
expectTypeOf(1).not.toBeNullable()
```

Detect assignability of unioned types:

```typescript
expectTypeOf<number>().toExtend<string | number>()
expectTypeOf<string | number>().not.toExtend<number>()
```

Use `.extract` and `.exclude` to narrow down complex union types:

```typescript
type ResponsiveProp<T> = T | T[] | {xs?: T; sm?: T; md?: T}
const getResponsiveProp = <T>(_props: T): ResponsiveProp<T> => ({})
type CSSProperties = {margin?: string; padding?: string}

const cssProperties: CSSProperties = {margin: '1px', padding: '2px'}

expectTypeOf(getResponsiveProp(cssProperties))
  .exclude<unknown[]>()
  .exclude<{xs?: unknown}>()
  .toBeIdenticalTo<CSSProperties>()

expectTypeOf(getResponsiveProp(cssProperties))
  .extract<unknown[]>()
  .toBeIdenticalTo<CSSProperties[]>()

expectTypeOf(getResponsiveProp(cssProperties))
  .extract<{xs?: any}>()
  .toBeIdenticalTo<{xs?: CSSProperties; sm?: CSSProperties; md?: CSSProperties}>()

expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().toHaveProperty('sm')
expectTypeOf<ResponsiveProp<number>>().exclude<number | number[]>().not.toHaveProperty('xxl')
```

`.extract` and `.exclude` return never if no types remain after exclusion:

```typescript
type Person = {name: string; age: number}
type Customer = Person & {customerId: string}
type Employee = Person & {employeeId: string}

expectTypeOf<Customer | Employee>().extract<{foo: string}>().toBeNever()
expectTypeOf<Customer | Employee>().exclude<{name: string}>().toBeNever()
```

Make assertions about object properties:

```typescript
const obj = {a: 1, b: ''}

// check that properties exist (or don't) with `.toHaveProperty`
expectTypeOf(obj).toHaveProperty('a')
expectTypeOf(obj).not.toHaveProperty('c')

// check types of properties
expectTypeOf(obj).toHaveProperty('a').toBeNumber()
expectTypeOf(obj).toHaveProperty('b').toBeString()
expectTypeOf(obj).toHaveProperty('a').not.toBeString()
```

`.toBeIdenticalTo` can be used to distinguish between functions:

```typescript
type NoParam = () => void
type HasParam = (s: string) => void

expectTypeOf<NoParam>().not.toBeIdenticalTo<HasParam>()
```

But often it's preferable to use `.parameters` or `.returns` for more specific function assertions:

```typescript
type NoParam = () => void
type HasParam = (s: string) => void

expectTypeOf<NoParam>().parameters.toBeIdenticalTo<[]>()
expectTypeOf<NoParam>().returns.toBeVoid()

expectTypeOf<HasParam>().parameters.toBeIdenticalTo<[string]>()
expectTypeOf<HasParam>().returns.toBeVoid()
```

More examples of ways to work with functions - parameters using `.parameter(n)` or `.parameters`, and return values using `.returns`:

```typescript
const f = (a: number) => [a, a]

expectTypeOf(f).toBeFunction()

expectTypeOf(f).toBeCallableWith(1)
expectTypeOf(f).not.toBeAny()
expectTypeOf(f).returns.not.toBeAny()
expectTypeOf(f).returns.toBeIdenticalTo<number[]>()
expectTypeOf(f).parameter(0).not.toBeIdenticalTo<string>()
expectTypeOf(f).parameter(0).toBeIdenticalTo<number>()
expectTypeOf(1).parameter(0).toBeNever()

const twoArgFunc = (a: number, b: string) => ({a, b})

expectTypeOf(twoArgFunc).parameters.toBeIdenticalTo<[number, string]>()
```

You can also check type guards & type assertions:

```typescript
const assertNumber = (v: any): asserts v is number => {
  if (typeof v !== 'number') {
    throw new TypeError('Nope !')
  }
}

expectTypeOf(assertNumber).asserts.toBeNumber()

const isString = (v: any): v is string => typeof v === 'string'
expectTypeOf(isString).guards.toBeString()
```

Assert on constructor parameters:

```typescript
expectTypeOf(Date).toBeConstructibleWith('1970')
expectTypeOf(Date).toBeConstructibleWith(0)
expectTypeOf(Date).toBeConstructibleWith(new Date())
expectTypeOf(Date).toBeConstructibleWith()

expectTypeOf(Date).constructorParameters.toBeIdenticalTo<[] | [string | number | Date]>()
```

Check function `this` parameters:

```typescript
function greet(this: {name: string}, message: string) {
  return `Hello ${this.name}, here's your message: ${message}`
}

expectTypeOf(greet).thisParameter.toBeIdenticalTo<{name: string}>()
```

Distinguish between functions with different `this` parameters:

```typescript
function greetFormal(this: {title: string; name: string}, message: string) {
  return `Dear ${this.title} ${this.name}, here's your message: ${message}`
}

function greetCasual(this: {name: string}, message: string) {
  return `Hi ${this.name}, here's your message: ${message}`
}

expectTypeOf(greetFormal).not.toBeIdenticalTo<typeof greetCasual>()
```

Class instance types:

```typescript
expectTypeOf(Date).instance.toHaveProperty('toISOString')
```

Promise resolution types can be checked with `.resolves`:

```typescript
const asyncFunc = async () => 123

expectTypeOf(asyncFunc).returns.resolves.toBeNumber()
```

Array items can be checked with `.items`:

```typescript
expectTypeOf([1, 2, 3]).items.toBeNumber()
expectTypeOf([1, 2, 3]).items.not.toBeString()
```

Check that functions never return:

```typescript
const thrower = () => {
  throw new Error('oh no')
}

expectTypeOf(thrower).returns.toBeNever()
```

Generics can be used rather than references:

```typescript
expectTypeOf<{a: string}>().not.toBeIdenticalTo<{a: number}>()
```

Distinguish between missing/null/optional properties:

```typescript
expectTypeOf<{a?: number}>().not.toBeIdenticalTo<{}>()
expectTypeOf<{a?: number}>().not.toBeIdenticalTo<{a: number}>()
expectTypeOf<{a?: number}>().not.toBeIdenticalTo<{a: number | undefined}>()
expectTypeOf<{a?: number | null}>().not.toBeIdenticalTo<{a: number | null}>()
expectTypeOf<{a: {b?: number}}>().not.toBeIdenticalTo<{a: {}}>()
```

Detect the difference between regular and readonly properties:

```typescript
type A1 = {readonly a: string; b: string}
type E1 = {a: string; b: string}

expectTypeOf<A1>().toExtend<E1>()
expectTypeOf<A1>().not.toBeIdenticalTo<E1>()

type A2 = {a: string; b: {readonly c: string}}
type E2 = {a: string; b: {c: string}}

expectTypeOf<A2>().toExtend<E2>()
expectTypeOf<A2>().not.toBeIdenticalTo<E2>()
```

Distinguish between classes with different constructors:

```typescript
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

expectTypeOf<typeof A>().not.toBeIdenticalTo<typeof B>()

class C {
  value: number
  constructor(c: 1) {
    this.value = c
  }
}

expectTypeOf<typeof A>().toBeIdenticalTo<typeof C>()
```

Functions with extra properties can be checked too:

```typescript
const augmented = Object.assign((a: number, b: number) => a + b, {foo: 'bar'})
expectTypeOf(augmented).toBeIdenticalTo<((a: number, b: number) => number) & {foo: string}>()
```
<!-- codegen:end -->

### Within test frameworks

#### Jest & `eslint-plugin-jest`
If you're using Jest along with `eslint-plugin-jest`, you will get warnings from the [`jest/expect-expect`](https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/expect-expect.md) rule, complaining that "Test has no assertions" for tests that only use `expectTypeOf()`.

To remove this warning, configure the ESlint rule to consider `expectTypeOf` as an assertion:

```js
"rules": {
  // ...
  "jest/expect-expect": [
    "warn",
    {
      "assertFunctionNames": [
        "expect", "expectTypeOf"
      ]
    }
  ],
  // ...
}
```

## Similar projects

Other projects with similar goals:

- [`tsd`](https://github.com/SamVerschueren/tsd) is a CLI that runs the TypeScript type checker over assertions
- [`ts-expect`](https://github.com/TypeStrong/ts-expect) exports several generic helper types to perform type assertions
- [`dtslint`](https://github.com/Microsoft/dtslint) does type checks via comment directives and tslint
- [`type-plus`](https://github.com/unional/type-plus) comes with various type and runtime TypeScript assertions
- [`static-type-assert`](https://github.com/ksxnodemodules/static-type-assert) type assertion functions

### Comparison

The key differences in this project are:

- a fluent, jest-inspired API, making the difference between `actual` and `expected` clear. This is helpful with complex types and assertions.
- inverting assertions intuitively and easily via `expectTypeOf(...).not`
- checks generics properly and strictly ([tsd doesn't](https://github.com/SamVerschueren/tsd/issues/142))
- first-class support for:
  - `any` (as well as `unknown` and `never`) (see issues outstanding at time of writing in tsd for [never](https://github.com/SamVerschueren/tsd/issues/78) and [any](https://github.com/SamVerschueren/tsd/issues/82)).
    - This can be especially useful in combination with `not`, to protect against functions returning too-permissive types. For example, `const parseFile = (filename: string) => JSON.parse(readFileSync(filename).toString())` returns `any`, which could lead to errors. After giving it a proper return-type, you can add a test for this with `expect(parseFile).returns.not.toBeAny()`
  - object properties
  - function parameters
  - function return values
  - constructor parameters
  - class instances
  - array item values
  - nullable types
- assertions on types "matching" rather than exact type equality, for "is-a" relationships e.g. `expectTypeOf(square).toMatchTypeOf<Shape>()`
- built into existing tooling. No extra build step, cli tool, IDE extension, or lint plugin is needed. Just import the function and start writing tests. Failures will be at compile time - they'll appear in your IDE and when you run `tsc`.
- small implementation with no dependencies. <200 lines of code - [take a look!](./src/index.ts) (tsd, for comparison, is [2.6MB](https://bundlephobia.com/result?p=tsd@0.13.1) because it ships a patched version of typescript).

## Contributing

In most cases, it's worth checking existing issues or creating on to discuss a new feature or a bug fix before opening a pull request.

Once you're ready to make a pull request: clone the repo, and install pnpm if you don't have it already with `npm install --global pnpm`. Lockfiles for `npm` and `yarn` are gitignored.

If you're adding a feature, you should write a self-contained usage example in the form of a test, in [test/usage.test.ts](./test/usage.test.ts). This file is used to populate the bulk of this readme using [eslint-plugin-codegen](https://npmjs.com/package/eslint-plugin-codegen), and to generate an ["errors" test file](./test/errors.test.ts), which captures the error messages that are emitted for failing assertions by the typescript compiler. So, the test name should be written as a human-readable sentence explaining the usage example. Have a look at the existing tests for an idea of the style.

After adding the tests, run `npm run lint -- --fix` to update the readme, and `npm test -- --updateSnapshot` to update the errors test. The generated documentation and tests should be pushed to the same branch as the source code, and submitted as a pull request. CI will test that the docs and tests are up to date if you forget to run these commands.
