import * as conf from '../src/config';
import * as weather from '../src/weather';
import * as pjutil from '../src/pjutil';

beforeAll(() => {
  conf.init();
});

afterAll(() => {
  // nothing
});

jest.setTimeout(65000);

test('get weather', async () => {
  try {
    const ret = await weather.testGetWeather();
    expect(ret).toEqual(expect.anything());
  }
  catch (err) {
    console.log(err);
  }
});

test('get today oneday msg', async () => {
  try {
    const ret = await weather.testGetTomorrowOnedayMsg();
    expect(ret).toEqual(expect.anything());
  }
  catch (err) {
    console.log(err);
  }
});

test('get today fiveday msg', async () => {
  try {
    const ret = await weather.testGetTomorrowFivedayMsg();
    expect(ret).toEqual(expect.anything());
  }
  catch (err) {
    console.log(err);
  }
});

test('get notify type', () => {
  // 1658668140: 2022/07/24(日) 22:09:00
  const ret1 = weather.testDecideNotifyType(1658668140);
  expect(ret1).toBe(3);

  // 1658697000: 2022/07/25(月) 06:10:00
  const ret2 = weather.testDecideNotifyType(1658697000);
  expect(ret2).toBe(2);

  // 1658754600: 2022/07/25(月) 22:10:00
  const ret3 = weather.testDecideNotifyType(1658754600);
  expect(ret3).toBe(1);

  // 1658754540: 2022/07/25(月) 22:09:00
  const ret4 = weather.testDecideNotifyType(1658754540);
  expect(ret4).toBe(0);

    // 1658719800: 2022/07/25(月) 12:30:00
  const ret5 = weather.testDecideNotifyType(1658719800);
  expect(ret5).toBe(0);
});

test('need decide notify type', () => {
  const nstamp = pjutil.getCurrentTime();

  // init
  const ret1 = weather.testNeedDecideNotifyType(0);
  expect(ret1).toBe(true);

  // after 1 sec
  const ret2 = weather.testNeedDecideNotifyType(nstamp - 1);
  expect(ret2).toBe(false);

  // after 30 sec
  const ret3 = weather.testNeedDecideNotifyType(nstamp - 30);
  expect(ret3).toBe(false);

  // after 60 sec
  const ret4 = weather.testNeedDecideNotifyType(nstamp - 60);
  expect(ret4).toBe(true);
});



