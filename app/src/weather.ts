
// const applog  = require('../lib/log/logger').applog;


import fetch from 'node-fetch';
import {format as uFormat} from 'util';
import * as pjutil from './pjutil';
import * as linebot from './linebot';
import * as conf from './config';
import { ConstVal as CV } from './const';
import { pjtype } from '../types/type';
import { applog } from './logger';

const API_DAILY_KEY = 'daily';
const API_HOURLY_KEY = 'hourly';
const API_RAINFALL_PROBABILITY_KEY = 'pop';
const API_WEATHER_NAME_KEY = 'weather.0.description';

const NOTIFY_TYPE = {
  ERROR:           -1,
  NOTHING:          0,
  TOMORROW_ONEDAY:  1,
  TODAY_ONEDAY:     2,
  TOMORROW_FIVEDAY: 3,
};

// 公式リファレンス
// https://openweathermap.org/api/one-call-api
// One Call APIは、地理座標について次の気象データを提供します。
// ・現在の天気
// ・1時間の分予報
// ・48時間の時間予報
// ・7日間の毎日の天気予報
// ・全国気象警報
// ・過去5日間の過去の気象データ


///////////////////////////
// closure
///////////////////////////
const createPreTime = (): (preTime?: number) => number | undefined => {
  let time = 0;

  return (preTime?: number) => {
    if (preTime) {
      time = preTime;
      return;
    }
    else {
      return time;
    }
  };
};

const cPreTime = createPreTime();

///////////////////////////
// private function
///////////////////////////

async function sendLineMsg(msg: string): Promise<void> {
  const ret = await linebot.sendMessage(msg);
  if (ret !== CV.OK) {
    applog.error('send message failed.');
  }
  return;
}


function isShowHour(hour: number): boolean {
  if (Number.isNaN(hour)) {
    return false;
  }

  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return false;
  }

  for (const i of wtconf.SHOW_HOUR) {
    if (hour === i) {
      return true;
    }
  }

  return false;
}


function getOnedayMsg(weather: pjtype.T_STR_BASE_OBJ, offset: number, format: string): string {
  if (!weather || offset < 0 || !format) {
    return '';
  }
  let msg = '';
  type t_winfo = { pop: string, hour: string };
  const dispData: t_winfo[] = [];
  let wstr = '';

  const hourly = weather[API_HOURLY_KEY];
  const daily  = weather[API_DAILY_KEY];
  if (typeof hourly !== 'object' || typeof hourly !== 'object') {
    applog.error('invalid weather response.');
    return msg;
  }

  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return msg;
  }

  const now = pjutil.getCurrentDateObj();
  if (!now) {
    applog.error('create current date failed.(now)');
    return msg;
  }

  const target = pjutil.getCurrentDateObj(now.stamp + offset * 60 * 60 * 24);
  if (!target) {
    applog.error('create current date failed.(target)');
    return msg;
  }

  for (const wobj of hourly) {
    const wdate = pjutil.getCurrentDateObj(wobj.dt);
    if (!wdate) {
      applog.error(`create current date failed.(${wobj.dt})`);
      return msg;
    }

    if (target.day === wdate.day && isShowHour(wdate.hour)) {
      if (!pjutil.includeObjKey(wobj, API_RAINFALL_PROBABILITY_KEY)) {
        continue;
      }
      const tmp = pjutil.getObjValue(wobj, API_RAINFALL_PROBABILITY_KEY);
      if (typeof tmp !== 'number') {
        continue;
      }

      const pop   = Math.floor(tmp * 100);
      const winfo = {
        pop:   pop.toString(10).padStart(3, ' '),
        hour:  wdate.hour.toString(10).padStart(2, '0'),
      };
      dispData.push(winfo);
    }
  }

  for (const wobj of daily) {
    const wdate = pjutil.getCurrentDateObj(wobj.dt);
    applog.error(`dt=${wobj.dt}`);
    if (!wdate) {
      applog.error(`create current date failed.(${wobj.dt})`);
      return msg;
    }
    if (target.day === wdate.day) {
      if (!pjutil.includeObjKey(wobj, API_WEATHER_NAME_KEY)) {
        continue;
      }
      const tmp = pjutil.getObjValue(wobj, API_WEATHER_NAME_KEY);
      if (typeof tmp !== 'string') {
        continue;
      }
      wstr = tmp;
      break;
    }
  }

  if (wtconf.SHOW_HOUR.length !== Object.keys(dispData).length) {
    applog.error(`Error create Tommorow Oneday data.
                conf=${wtconf.SHOW_HOUR.length}, 
                data=${Object.keys(dispData).length}`);
  }
  else {
    msg = uFormat(format, target.day, wstr,
      dispData[0].hour, dispData[0].pop,
      dispData[1].hour, dispData[1].pop,
      dispData[2].hour, dispData[2].pop,
      dispData[3].hour, dispData[3].pop,
      dispData[4].hour, dispData[4].pop,
      dispData[5].hour, dispData[5].pop);
    applog.error(`msg=${msg}`);
  }

  return msg;
}


function createTomorrowOneday(weather: pjtype.T_STR_BASE_OBJ): string {
  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return '';
  }

  return getOnedayMsg(weather, 1, wtconf.NIGHT_MSG);
}


function createTodayOneday(weather: pjtype.T_STR_BASE_OBJ): string {
  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return '';
  }

  return getOnedayMsg(weather, 0, wtconf.MORNING_MSG);
}



function createTomorrowFiveday(weather: pjtype.T_STR_BASE_OBJ): string {
  let msg = '';
  type t_winfo = { pop: string, month: string, day: string, wstr: string };
  const dispData: t_winfo[] = [];

  if (!weather) {
    return msg;
  }

  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return msg;
  }

  const daily = weather[API_DAILY_KEY];
  if (!daily) {
    applog.error('invalid weather response.');
    return msg;
  }
  applog.error(`daily.length=${daily.length}`);

  const now = pjutil.getCurrentDateObj();
  if (!now) {
    applog.error('create date object failed.');
    return msg;
  }

  for (const wobj of daily) {
    const wdate = pjutil.getCurrentDateObj(wobj.dt);
    if (!wdate) {
      applog.error('create date object failed.');
      return msg;
    }

    if (now.day < wdate.day || now.month < wdate.month || now.year < wdate.year) {
      if (!pjutil.includeObjKey(wobj, API_RAINFALL_PROBABILITY_KEY)) {
        continue;
      }
      const tmp1 = pjutil.getObjValue(wobj, API_RAINFALL_PROBABILITY_KEY);
      if (typeof tmp1 !== 'number') {
        continue;
      }
      const pop = Math.floor(tmp1 * 100);

      if (!pjutil.includeObjKey(wobj, API_WEATHER_NAME_KEY)) {
        continue;
      }
      const tmp2 = pjutil.getObjValue(wobj, API_WEATHER_NAME_KEY);
      if (typeof tmp2 !== 'string') {
        continue;
      }
      const wstr = tmp2;
      const winfo = {
        pop:   pop.toString(10).padStart(3, ' '),
        month: wdate.month.toString(10).padStart(2, '0'),
        day: wdate.day.toString(10).padStart(2, '0'),
        wstr: wstr,
      };
      dispData.push(winfo);
    }
  }

  if (Object.keys(dispData).length < 5) {
    applog.error(`Error create Tommorow Fiveday data.(${Object.keys(dispData).length})`);
  }
  else {
    msg = uFormat(wtconf.FIVEDAY_MSG, 
                    dispData[0].month, dispData[0].day, dispData[0].pop, dispData[0].wstr,
                    dispData[1].month, dispData[1].day, dispData[1].pop, dispData[1].wstr,
                    dispData[2].month, dispData[2].day, dispData[2].pop, dispData[2].wstr,
                    dispData[3].month, dispData[3].day, dispData[3].pop, dispData[3].wstr,
                    dispData[4].month, dispData[4].day, dispData[4].pop, dispData[4].wstr);
    applog.debug(`msg=${msg}`);
  }

  return msg;
}

function createOnecallAPI(): string | null {
  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    return null;
  }

  const api = wtconf.BASE_URL +
      '?lat=' + wtconf.LATITUDE +
      '&lon=' + wtconf.LONGITUDE +
      '&exclude=' + wtconf.EXCLUDE_KEY +
      '&appid=' + wtconf.API_KEY +
      '&lang=ja&units=metric';

  applog.debug('api = %s', api);

  return api;
}


async function getWeather(): Promise<object> {
  const api = createOnecallAPI();

  if (!api) {
    applog.error('create Onecall API failed.');
    throw new Error('api failed');  
  }

  try {
    const res = await fetch(api);
    
    if (res.ok) {
      const data = await res.json();
      if (typeof data === 'object' && data) {
        return data;
      }
      else {
        throw new Error('Unexpected response type');
      }
    }
    else {
      throw new Error('response invalid.');
    }
  }
  catch (err) {
    applog.error('get weather api failed.');
    throw err;
  }
}


async function notifyWeather(type: number): Promise<pjtype.T_STAT> {
  let weather = {};
  try {
    weather = await getWeather();
  }
  catch (err) {
    applog.error(err);
    return CV.NG;
  }

  let msg = '';
  switch(type) {
  case NOTIFY_TYPE.TOMORROW_ONEDAY:
    msg = createTomorrowOneday(weather);
    break;
  case NOTIFY_TYPE.TODAY_ONEDAY:
    msg = createTodayOneday(weather);
    break;
  case NOTIFY_TYPE.TOMORROW_FIVEDAY:
    msg = createTomorrowFiveday(weather);
    break;
  default:
    applog.error('Not expected type.');
    break;
  }

  if (!msg) {
    applog.error('send message is empty.');
    return CV.NG;
  }
  sendLineMsg(msg);

  return CV.OK;

}


function isNotifyWeek(today: number): boolean {
  if (today < 0) {
    return false;
  }

  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    throw CV.NG;
  }

  for (const week of wtconf.NOTIFY_FIVEDAY_WEEK) {
    if (today === pjutil.getWeekNum(week)) {
      return true;
    }
  }

  return false;
}


function decideNotify(now: pjtype.T_DATE_OBJ): number {
  let ret = NOTIFY_TYPE.NOTHING;

  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    throw NOTIFY_TYPE.ERROR;
  }
  
  // five day notify
  if (now.hour == wtconf.NOTIFY_NIGHT_HOUR &&
    now.min == wtconf.NOTIFY_MINUTE_FIVEDAY &&
    isNotifyWeek(now.week)) {
      ret = NOTIFY_TYPE.TOMORROW_FIVEDAY;
  }
  // today notify 
  else if (now.hour === wtconf.NOTIFY_MORNING_HOUR &&
    now.min === wtconf.NOTIFY_MINUTE_ONEDAY) {
      ret = NOTIFY_TYPE.TODAY_ONEDAY;
  }
  // tomorrow notify
  else if (now.hour == wtconf.NOTIFY_NIGHT_HOUR &&
    now.min == wtconf.NOTIFY_MINUTE_ONEDAY) {
      ret = NOTIFY_TYPE.TOMORROW_ONEDAY;
  }

  return ret;
}

function needDecideNotifyType(): boolean {
  const ptime = cPreTime();
  const ntime = pjutil.getCurrentTime();

  if (typeof ptime === 'undefined' || ntime - ptime < 60) {
    applog.debug(`No more than 60 seconds have elapsed since the last time.
                now=${ntime}, pre=${ptime}`);
    return false;
  }
  cPreTime(ntime);

  return true;
}

function intervalWeather(): void {
  const now = pjutil.getCurrentDateObj();
  if (!now) {
    applog.error('get date object failed.');
    return;
  }

  if (!needDecideNotifyType()) {
    return;
  }

  const ret = decideNotify(now);

  switch(ret) {
  case NOTIFY_TYPE.NOTHING:
    applog.debug('Not notify weather.');
    break;
  case NOTIFY_TYPE.TOMORROW_ONEDAY:
  case NOTIFY_TYPE.TODAY_ONEDAY:
  case NOTIFY_TYPE.TOMORROW_FIVEDAY:
    notifyWeather(ret);
    break;
  default:
    applog.error('Not expected ret type.(%d)', ret);
    break;
  }

  return;
}

///////////////////////////
// public function
///////////////////////////

export function init(): pjtype.T_STAT {
  const wtconf = conf.getWeatherConfig();
  if (!wtconf) {
    applog.error('get weather config failed.');
    throw CV.NG;
  }

  try {
    setInterval(intervalWeather, wtconf.INTERVAL_TIME_MS);
  }
  catch (err) {
    applog.error(err);
    return CV.NG;
  }

  return CV.OK;
}

///////////////////////////
// test interface
///////////////////////////

export function testGetWeather(): Promise<pjtype.T_STR_BASE_OBJ> {
  return getWeather();
}

export async function testGetTodayOnedayMsg(): Promise<string> {
  const weather = await getWeather();
  return createTodayOneday(weather);
}

export async function testGetTomorrowOnedayMsg(): Promise<string> {
  const weather = await getWeather();
  return createTomorrowOneday(weather);
}

export async function testGetTomorrowFivedayMsg(): Promise<string> {
  const weather = await getWeather();
  return createTomorrowFiveday(weather);
}

export function testDecideNotifyType(stamp: number): number {
  const tm = pjutil.getCurrentDateObj(stamp);
  if (!tm) {
    applog.error('get date object failed.');
    return -1;
  }
  return decideNotify(tm);
}

export function testNeedDecideNotifyType(stamp: number): boolean {
  cPreTime(stamp);
  return needDecideNotifyType();
}
