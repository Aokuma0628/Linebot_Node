import * as conf from '../src/config';
import * as pjutil from '../src/pjutil';
import * as interval from '../src/interval-msg';
import * as db from '../src/db';

beforeAll(async () => {
  await conf.init();
  await db.init();
});

afterAll(async () => {
  await db.end();
});

const date = pjutil.getCurrentDateObj();
if (!date) {
  console.log('create date object failed.');
  throw new Error('finish');
}

const row: db.T_TABLE_INTERVAL_MSG = {
  id:          1,
  b_mon:       false,
  b_week:      false,
  b_day:       false,
  month:       date.month,
  week:        date.week,
  day:         date.day,
  hour:        date.hour,
  minute:      date.min,
  type:        'text',
  message:     'test',
  done:        false,
  week_number: 0,
  constructor: { name: 'RowDataPacket' },
};

test('check month data', async () => {
  const monRow = JSON.parse(JSON.stringify(row));
  monRow.b_mon = true;

  let ret = await interval.testCheckCycle(monRow);
  expect(ret).toBe(true);

  monRow.day += 1;
  ret = await interval.testCheckCycle(monRow);
  expect(ret).toBe(false);
});

test('check week data', async () => {
  const weekRow = JSON.parse(JSON.stringify(row));
  weekRow.b_week = true;

  let ret = await interval.testCheckCycle(weekRow);
  expect(ret).toBe(true);

  weekRow.week += 1;
  ret = await interval.testCheckCycle(weekRow);
  expect(ret).toBe(false);
});

test('check day data', async () => {
  const dayRow = JSON.parse(JSON.stringify(row));
  dayRow.b_day = true;

  let ret = await interval.testCheckCycle(dayRow);
  expect(ret).toBe(true);

  dayRow.hour += 1;
  ret = await interval.testCheckCycle(dayRow);
  expect(ret).toBe(false);
});

