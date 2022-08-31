import * as conf from '../src/config';
import { ConstVal as CV } from '../src/const';
import * as linebot from '../src/linebot';

beforeAll(() => {
  conf.init();
});

afterAll(() => {
  // nothing
});


test('linebot init', async () => {
  try {
    const ret = await linebot.init();
    expect(ret).toBe(CV.OK);
  }
  catch (err) {
    console.log(err);
  }
});

test('linebot send message', async () => {
  const ret = await linebot.sendMessage('jest test');
  expect(ret).toBe(CV.OK);
});

