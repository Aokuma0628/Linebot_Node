import * as conf from '../src/config';
import { ConstVal as CV } from '../src/const';

test('config init', () => {
  expect(conf.init()).toBe(CV.OK);
});

test('get config db', () => {
  const dbconf = conf.getDbConfig();
  expect(dbconf).toEqual(expect.anything());
});

