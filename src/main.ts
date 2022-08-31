import * as db from './db';
import * as linebot from './linebot';
import * as interval from './interval-msg';
import * as weather from './weather';
import * as conf from './config';
import { applog } from './logger';
import { ConstVal as CV } from './const';

async function run(): Promise<void> {
  let ret = CV.NG;
  if (conf.init() !== CV.OK) {
    applog.error('conf init error.');
    throw new Error('failed');
  }

  ret = await db.init();
  if (ret !== CV.OK) {
    applog.error('db init error.');
    throw new Error('failed');
  }

  if (linebot.init() !== CV.OK) {
    applog.error('linebot init error.');
    throw new Error('failed');
  }

  if (weather.init() !== CV.OK) {
    applog.error('weather init error.');
    throw new Error('failed');
  }

  if (interval.init() !== CV.OK) {
    applog.error('interval msg init error.');
    throw new Error('failed');
  }

  applog.info('init finish.');

  return;
}

run();
