import * as fs from 'fs';
import { applog } from './logger';
import { ConstVal as CV } from './const';
import { pjtype } from '../types/type';

const CONFIG_KEY_DB   = 'db';
const CONFIG_KEY_LINE = 'line';
const CONFIG_KEY_WEATHER = 'weather';
const CONFIG_KEY_INTERVAL_MSG = 'interval_msg';
const CONFIG_KEY_REPLY_MSG = 'reply_msg';
const APP_CONFIG_PATH = __dirname + '/../config/appconf.json';

export type T_CONFIG_DB = {
  'DBNAME_LINEBOT': string,
  'TBNAME_INTERVAL_MSG': string,
  'TBNAME_REPLY_MSG': string,
  'DB_HOSTNAME': string,
  'DB_USER': string,
  'DB_PASSWD': string
};

export type T_CONFIG_LINE = {
  'TEST_MODE': boolean,
  'TEST_CHANNEL_SECRET': string,
  'TEST_CHANNEL_ACCESS_TOKEN': string,
  'CHANNEL_SECRET': string,
  'CHANNEL_ACCESS_TOKEN': string,
  'DEFAULT_PORT': number,
};

export type T_CONFIG_WEATHER = {
  'API_KEY': string,
  'LATITUDE': number,
  'LONGITUDE': number,
  'EXCLUDE_KEY': string,
  'INTERVAL_TIME_MS': number,
  'NOTIFY_MORNING_HOUR': number,
  'NOTIFY_NIGHT_HOUR': number,
  'NOTIFY_MINUTE_ONEDAY': number,
  'NOTIFY_MINUTE_FIVEDAY': number,
  'NOTIFY_FIVEDAY_WEEK': string[],
  'BASE_URL': string,
  'SHOW_HOUR': number[],
  'NIGHT_MSG': string,
  'MORNING_MSG': string,
  'FIVEDAY_MSG': string,
};

export type T_CONFIG_INTERVAL_MSG = {
  'INTERVAL_TIME_MS': number,
}

export type T_CONFIG_REPLY_MSG = {
  'NOT_FOUND_MSG': string,
}

export type T_CONFIG_KEY = {
  'db': T_CONFIG_DB,
  'line': T_CONFIG_LINE,
  'weather': T_CONFIG_WEATHER,
  'interval_msg': T_CONFIG_INTERVAL_MSG,
  'reply_msg': T_CONFIG_REPLY_MSG,
};

let gConf: T_CONFIG_KEY;

///////////////////////////
// public function
///////////////////////////
export function init(): pjtype.T_STAT {
  let conf = '';
  try {
    conf = fs.readFileSync(APP_CONFIG_PATH, 'utf-8');
    gConf = JSON.parse(conf);
  } catch (err) {
    applog.error('read config file error.', err);
    return CV.NG;
  }

  return CV.OK;
}

export function getDbConfig(): null | T_CONFIG_DB {
  if (!gConf || !gConf[CONFIG_KEY_DB]) {
    applog.error('Get db config failed.');
    return null;
  }

  return gConf[CONFIG_KEY_DB];
}

export function getLineConfig(): null | T_CONFIG_LINE {
  if (!gConf || !gConf[CONFIG_KEY_LINE]) {
    applog.error('Get Linebot config failed.');
    return null;
  }

  return gConf[CONFIG_KEY_LINE];
}

export function getWeatherConfig(): null | T_CONFIG_WEATHER {
  if (!gConf || !gConf[CONFIG_KEY_WEATHER]) {
    applog.error('Get weather config failed.');
    return null;
  }

  return gConf[CONFIG_KEY_WEATHER];
}

export function getIntervalMsgConfig(): null | T_CONFIG_INTERVAL_MSG {
  if (!gConf || !gConf[CONFIG_KEY_INTERVAL_MSG]) {
    applog.error('Get interval message config failed.');
    return null;
  }

  return gConf[CONFIG_KEY_INTERVAL_MSG];
}

export function getReplyMsgConfig(): null | T_CONFIG_REPLY_MSG {
  if (!gConf || !gConf[CONFIG_KEY_REPLY_MSG]) {
    applog.error('Get interval message config failed.');
    return null;
  }

  return gConf[CONFIG_KEY_REPLY_MSG];
}

