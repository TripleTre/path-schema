import { Path } from './path';

test('parse params list', () => {
  const p1 = new Path('/item1/item2');
  // @ts-ignore
  expect(p1._params.length).toBe(2);
  // @ts-ignore
  expect(p1._params[0]).toStrictEqual(['item1', true, false]);
  // @ts-ignore
  expect(p1._params[1]).toStrictEqual(['item2', true, false]);

  const p2 = new Path<{a: 'a'}>('/item0/:item1/:item2?');
  // @ts-ignore
  expect(p2._params.length).toBe(3);
  // @ts-ignore
  expect(p2._params[0]).toStrictEqual(['item0', true, false]);
  // @ts-ignore
  expect(p2._params[1]).toStrictEqual(['item1', true, true]);
  // @ts-ignore
  expect(p2._params[2]).toStrictEqual(['item2', false, true]);

  expect(() => {
    new Path('/:item0?/item1/:item2');
  }).toThrowError(/Optional parameters must follow all required parameters/);

  const p3 = p1.extends<{c: 'c'}>('/p3_item0/:p3_item1?');
  // @ts-ignore
  expect(p3._params.length).toBe(4);
  // @ts-ignore
  expect(p3._params[2]).toStrictEqual(['p3_item0', true, false]);
  // @ts-ignore
  expect(p3._params[3]).toStrictEqual(['p3_item1', false, true]);

  expect(() => {
    p2.extends('/item4');
  }).toThrowError(/Optional parameters must follow all required parameters/);
});

test('to path', () => {
  const p1 = new Path('/item1/item2');
  expect(p1.toPathString()).toBe('/item1/item2');

  const p2 = new Path<{a: string}>('/item1/:a');
  expect(p2.toPathString({a: 'item2'})).toBe('/item1/item2');

  const p3 = p2.extends<{b: number}>('/item3/:b');
  expect(p3.toPathString({a: 'item2', b: 10010})).toBe('/item1/item2/item3/10010');

  const p4 = p1.extends<{c?: string}>('/:c?');
  expect(p4.toPathString({c: 'item3'})).toBe('/item1/item2/item3');
  expect(p4.toPathString({})).toBe('/item1/item2');
});

test('to route string', () => {
  const p1 = new Path('/item1/item2');
  expect(p1.patternString).toBe('/item1/item2');

  const p2 = p1.extends('/:item3/:item4?');
  expect(p2.patternString).toBe('/item1/item2/:item3/:item4?');
});

test('to regexp', () => {
  const p1 = new Path('/item1/item2');
  expect(p1.regexp.test('/item1/item2')).toBe(true);

  const p2 = p1.extends<{a: string, b: string}>('/:a/:b?');
  expect(p2.regexp.test('/item1/item2/a/b')).toBe(true);
  expect(p2.regexp.test('/item1/item2/a/b/c')).toBe(false);
  expect(p2.regexp.test('/item1/item2/a')).toBe(true);
  expect(p2.regexp.test('/item1/item2/a/')).toBe(true);
});

test('to state', () => {
  const p1 = new Path('/item1/item2');

  const p2 = p1.extends<{a: string, b: string}>('/:a/:b?');
  expect(p2.toObject('/item1/item2/aaa/bbb')).toStrictEqual({a: 'aaa', b: 'bbb'});
  expect(p2.toObject('/item')).toBe(null);
  expect(p2.toObject('/item1/item2/123')).toStrictEqual({a: '123'});
});
