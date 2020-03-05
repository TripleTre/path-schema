# path-schema

Dynamic path generator and parser. Width Comprehensive typescript type checking.

## Install

```
npm i path-schema --save
```

## Usage

### Create path object

```typescript
// Create static path
var p = new Path('/item1/item2');

// Create dynamic path
var dp = new Path<{name: string}>('/item1/:name');

// Optional parameter
var op = new Path<{name: string, type?: string}>('/item1/:name/:type?');

// Derive from parent path
var sp = dp.extends<{id: string}>('/withId/:id');
```

### Generate path from parameter

```typescript
p.toPathString();
// => '/item1/item2'

dp.toPathString({name: 'foo'});
// => '/item1/foo'

op.toPathString({name: 'foo', type: 'baz'});
// => '/item1/foo/baz'

sp.toPathString({id: 'id'});
// typescript error:
//   Property 'name' is missing in type '{ id: string; }' but required in type '{ name: string; }'.

sp.toPathString({id: 'id', name: 'name'});
// => '/item1/name/widthId/id'
```

### parser parameter from path
```typescript
p.toObject('/item1/item2');
// => {}

dp.toObject('/item1/foo');
// => {name: foo}

op.toObject('/item1/foo/baz');
// => {name: 'foo', type: 'baz'}
```

### Others

```typescript
// regular expression object
p.regexp.test('/item1/item2');
// => true

// The entire path pattern
sp.patternString;
// => /item1/:name/withId/:id
```
