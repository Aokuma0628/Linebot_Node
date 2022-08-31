import { format as fnsFormat } from 'date-fns';
import { format as utilFormat } from 'util';
import { pjtype } from '../types/type';
import { applog } from './logger';


const WEEK_NUM: {[key: string]: number} = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

///////////////////////////
// public function
///////////////////////////
export function isEmpty(obj: object): boolean {
  if (!obj) {
    return false;
  }

  return !Object.keys(obj).length;
}

export function printf(format: string, ...args: unknown[]): void {
  console.log(utilFormat(format, ...args));
}

export function getCurrentDateObj(unixtm?: number): pjtype.T_DATE_OBJ | null {
  if (unixtm && unixtm < 0) {
    return null;
  }

  const date = unixtm ? new Date(unixtm * 1000) : new Date();
  const obj: pjtype.T_DATE_OBJ = {
    year   : parseInt(fnsFormat(date, 'yyyy'), 10),
    month  : parseInt(fnsFormat(date, 'MM'),   10),
    week   : date.getDay(),
    day    : parseInt(fnsFormat(date, 'dd'),   10),
    hour   : parseInt(fnsFormat(date, 'HH'), 10),
    min    : parseInt(fnsFormat(date, 'mm'),   10),
    sec    : parseInt(fnsFormat(date, 'ss'), 10),
    stamp  : Math.floor(date.getTime() / 1000),
  };

  return obj;
}


export function getCurrentTime(): number {
  const date = new Date();
  const msec = date.getTime();

  return Math.floor(msec / 1000);
}


export function getWeekNum(str: string): number {
  return str in WEEK_NUM ? WEEK_NUM[str] : -1;
}


export function includeObjKey(obj: object, path: string): boolean {
  if (!obj || !path) {
    return false;
  }

  let target: pjtype.T_STR_BASE_OBJ = Object.assign({}, obj);
  const keys = path.split('.');

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(!Object.prototype.hasOwnProperty.call(target, key)) {
      return false;
    }
    target = target[key];
  }
  return true;
}


export function getObjValue(obj: object, path: string): unknown {
  if (!obj || !path) {
    return undefined;
  }

  let target: pjtype.T_STR_BASE_OBJ = Object.assign({}, obj);
  const keys = path.split('.');
  const num = keys.length;

  for (let i = 0; i < num; i++) {
    const key = keys[i];
    if(target[key] == null) {
      return i === num - 1 ? target[key] : undefined;
    }
    target = target[key];
  }
  return target;
}
