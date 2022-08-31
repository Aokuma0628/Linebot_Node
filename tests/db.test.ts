import * as conf from '../src/config';
import { ConstVal as CV } from '../src/const';
import * as db from '../src/db';

beforeAll(() => {
  conf.init();
});

afterAll(() => {
  db.end();
});


test('db init', async () => {
  try {
    const ret = await db.init();
    expect(ret).toBe(CV.OK);
  }
  catch (err) {
    console.log(err);
  }

});

test('db get interval msg', async () => {
  const ret = await db.getIntervalMessageList();
  expect(ret).toEqual(expect.anything());
});

test('db get reply msg', async () => {
  const ret = await db.getReplyMessageList();
  expect(ret).toEqual(expect.anything());
});


