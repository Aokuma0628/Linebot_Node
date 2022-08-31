import * as pjutil from '../src/pjutil';

beforeAll(() => {
  // nothing
});

afterAll(() => {
  // nothing
});

const obj = {
  a: 1,
  b: 'abc',
  c: {
    d: 200,
    e: 'ABC',
    f: {
      g: 'TEST!!!',
    },
  },
};

test('get date object', () => {
  const dobj = pjutil.getCurrentDateObj();
  expect(dobj).toEqual(expect.anything());
});

test('get week number', () => {
  const ret = pjutil.getWeekNum('Wednesday');
  expect(ret).toBe(3);
});


test('search object key', () => {
  const ret1 = pjutil.includeObjKey(obj, 'a');
  expect(ret1).toBe(true);
  const ret2 = pjutil.includeObjKey(obj, 'c.d');
  expect(ret2).toBe(true);
  const ret3 = pjutil.includeObjKey(obj, 'c.f.g');
  expect(ret3).toBe(true);
  const ret4 = pjutil.includeObjKey(obj, 'z');
  expect(ret4).toBe(false);
  const ret5 = pjutil.includeObjKey(obj, 'c.f.aaa');
  expect(ret5).toBe(false);
});


test('get object value', () => {
  const ret1 = pjutil.getObjValue(obj, 'a');
  expect(ret1).toBe(1);
  const ret2 = pjutil.getObjValue(obj, 'c.d');
  expect(ret2).toBe(200);
  const ret3 = pjutil.getObjValue(obj, 'c.f.g');
  expect(ret3).toBe('TEST!!!');
  const ret4 = pjutil.getObjValue(obj, 'c.f.z');
  expect(ret4).toBe(undefined);
});
