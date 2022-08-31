import * as db from './db';
import * as pjutil from './pjutil';
import * as linebot from './linebot';
import * as conf from './config';
import { ConstVal as CV } from './const';
import { pjtype } from '../types/type';
import { applog } from './logger';

let gIntervalId: NodeJS.Timer | null = null;

///////////////////////////
// private function
///////////////////////////
function checkCycleMonth(row: db.T_TABLE_INTERVAL_MSG): boolean {
  let ret = false;

  const date = pjutil.getCurrentDateObj();
  if (!date) {
    applog.error(`create date object failed.`);
    return ret;
  }

  if (row.day === date.day &&
      row.hour === date.hour &&
      row.minute === date.min) {
    ret = true;
  }

  return ret;
}

function checkCycleWeek(row: db.T_TABLE_INTERVAL_MSG): boolean {
  let ret = false;

  const date = pjutil.getCurrentDateObj();
  if (!date) {
    applog.error(`create date object failed.`);
    return ret;
  }

  if (row.week_number !== 0) {
    const number = Math.floor((date.day - 1) / 7);
    const isWeekNum = row.week_number & (1 << number);
    if (!isWeekNum) {
      return ret;
    }
  }

  if (row.week === date.week &&
      row.hour === date.hour &&
      row.minute === date.min) {
    ret = true;
  }


  return ret;
}

function checkCycleDay(row: db.T_TABLE_INTERVAL_MSG): boolean {
  let ret = false;

  const date = pjutil.getCurrentDateObj();
  if (!date) {
    applog.error(`create date object failed.`);
    return ret;
  }
  
  if (row.hour === date.hour &&
      row.minute === date.min) {
    ret = true;
  }

  return ret;
}

function validateRowDate(row: db.T_TABLE_INTERVAL_MSG): pjtype.T_STAT {
  if (row.b_mon && (row.day < 1 || row.day > 31)) {
    applog.error('month is out of range (%d)', row.day);
    return CV.NG;
  }
  if (row.week < 0 || row.week > 6) {
    applog.error('week is out of range (%d)', row.week);
    return CV.NG;
  }
  if (row.hour < 0 || row.hour > 24) {
    applog.error('hour is out of range (%d)', row.hour);
    return CV.NG;
  }
  if (row.minute < 0 || row.minute > 60) {
    applog.error('minute is out of range (%d)', row.minute);
    return CV.NG;
  }
  
  return CV.OK;
}

function isLastSend(row: db.T_TABLE_INTERVAL_MSG): boolean {
  const date = pjutil.getCurrentDateObj();
  if (!date) {
    applog.error(`create date object failed.`);
    return false;
  }

  if (row.done) {
    if (date.min > row.minute || date.hour > row.hour ||
        (date.hour === 0 && date.min === 0 && row.hour === 23 && row.minute === 59)) {
      applog.debug('Last send row (%d)', row.id);
      return true;
    }
  }
  
  return false;
}

function isAlreadySent(row: db.T_TABLE_INTERVAL_MSG): boolean {
  if (row.done) {
    applog.debug('Already send row (%d)', row.id);
    return true;
  }
  return false;
}

async function checkCycle(row: db.T_TABLE_INTERVAL_MSG): Promise<boolean> {
  let ret = false;

  if (validateRowDate(row) !== CV.OK) {
    return ret;
  }

  if (isLastSend(row)) {
    await db.setDone(row.id, false);
    return ret;
  }

  if (isAlreadySent(row)) {
    return ret;
  }

  if (row.b_mon) {
    ret = checkCycleMonth(row);
  }
  else if (row.b_week) {
    ret = checkCycleWeek(row);
  }
  else if (row.b_day) {
    ret = checkCycleDay(row);
  }

  return ret;
}


async function mainLoop(): Promise<void> {
  let ret = false;
  let list: db.T_TABLE_INTERVAL_MSG[];

  try {
    const ret = await db.getIntervalMessageList();
    if (!ret) {
      applog.error('interval message list is null.');
      return;
    }
    list = ret;
  }
  catch (err) {
    applog.error(err);
    return;
  }
  
  for (const row of list) {
    ret = await checkCycle(row);
    if (ret) {
      const result = await linebot.sendMessage(row.message);
      if (result !== CV.OK) {
        applog.error('send message failed.(%d: %s)', row.id, row.message);
        return;
      }
      applog.info('send message success.(%d:%s)', row.id, row.message);
      await db.setDone(row.id, true);
    }
  }

  return;
}

///////////////////////////
// public function
///////////////////////////
export function init(): pjtype.T_STAT {
  const config = conf.getIntervalMsgConfig();

  if (!config) {
    applog.error('get interval message config failed.');
    throw CV.NG;
  }

  gIntervalId = setInterval(mainLoop, config.INTERVAL_TIME_MS);
  applog.debug(`id = ${gIntervalId}`);

  return CV.OK;
}

export function end(): void {
  if (gIntervalId) {
    clearInterval(gIntervalId);
    gIntervalId = null;
  }
}

export async function testCheckCycle(row: db.T_TABLE_INTERVAL_MSG): Promise<boolean> {
  const ret = await checkCycle(row);
  return ret;
}
