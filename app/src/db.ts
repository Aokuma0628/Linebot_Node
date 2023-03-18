import * as mysql from 'mysql2/promise';
import { applog } from './logger';
import * as conf from './config';
import { ConstVal as CV } from './const';
import { pjtype } from '../types/type';

// +---------+--------------+------+-----+---------+-------+
// | Field   | Type         | Null | Key | Default | Extra |
// +---------+--------------+------+-----+---------+-------+
// | id      | int          | NO   | PRI | NULL    |       |
// | b_mon   | tinyint      | YES  |     | NULL    |       |
// | b_week  | tinyint      | YES  |     | NULL    |       |
// | b_day   | tinyint      | YES  |     | NULL    |       |
// | month   | int          | YES  |     | NULL    |       |
// | week    | int          | YES  |     | NULL    |       |
// | day     | int          | YES  |     | NULL    |       |
// | hour    | int          | YES  |     | NULL    |       |
// | minute  | int          | YES  |     | NULL    |       |
// | type    | varchar(45)  | YES  |     | NULL    |       |
// | message | varchar(100) | YES  |     | NULL    |       |
// | done    | tinyint      | YES  |     | NULL    |       |
// | week_number | int      | YES  |     | NULL    |       |
// +---------+--------------+------+-----+---------+-------+

// +-------+--------------+------+-----+---------+-------+
// | Field | Type         | Null | Key | Default | Extra |
// +-------+--------------+------+-----+---------+-------+
// | id    | int          | NO   | PRI | NULL    |       |
// | req   | varchar(100) | NO   |     | NULL    |       |
// | res   | varchar(100) | NO   |     | NULL    |       |
// +-------+--------------+------+-----+---------+-------+
let gConnection:mysql.Connection | null = null;
type T_MYSQL_ROWS = mysql.RowDataPacket[] | mysql.RowDataPacket[][] |
                    mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader;

export interface T_TABLE_INTERVAL_MSG extends mysql.RowDataPacket {
  id:          number,
  b_mon:       boolean,
  b_week:      boolean,
  b_day:       boolean,
  month:       number,
  week:        number,
  day:         number,
  hour:        number,
  minute:      number,
  type:        string,
  message:     string,
  done:        boolean,
  week_number: number,
}

export interface T_TABLE_REP_MSG extends mysql.RowDataPacket {
  id:  number,
  req: string,
  res: string,
}

///////////////////////////
// private function
///////////////////////////
async function selectQuery(sql: string): Promise<T_MYSQL_ROWS> {
  if (!sql) {
    throw CV.NG;
  }

  if (!gConnection) {
    applog.error('DB initial processing has not been executed.');
    throw CV.NG;
  }

  applog.debug('sql = %s', sql);

  try {
    const [rows, field] = await gConnection.query(sql);
    field;  // unused "field"
    return rows;
  } catch {
    applog.error(`select query failed.(${sql})`);
    throw CV.NG;
  }
}

async function updateQuery(sql: string): Promise<pjtype.T_STAT> {
  if (!sql) {
    throw CV.NG;
  }

  if (!gConnection) {
    applog.error('DB initial processing has not been executed.');
    throw CV.NG;
  }

  applog.debug('sql = %s', sql);

  try {
    await gConnection.query(sql);
    return CV.OK;
  } catch {
    applog.error(`update query failed.(${sql})`);
    throw CV.NG;
  }
}


///////////////////////////
// public function
///////////////////////////
export async function getIntervalMessageList(): Promise<T_TABLE_INTERVAL_MSG[] | null> {
  const dbconf = conf.getDbConfig();
  if (!dbconf) {
    applog.error('get db config failed.');
    throw CV.NG;
  }
  const sql = 'select * from ' + dbconf.DBNAME_LINEBOT + '.' + dbconf.TBNAME_INTERVAL_MSG + ';';

  try {
    const result = await selectQuery(sql);
    if (Array.isArray(result) && result.length > 0) {
      const list = result as T_TABLE_INTERVAL_MSG[];
      return list;
    }
    return null;
  }
  catch (err) {
    applog.error(err);
    return null;
  }
}


export async function getReplyMessageList(): Promise<T_TABLE_REP_MSG[] | null> {
  const dbconf = conf.getDbConfig();
  if (!dbconf) {
    applog.error('get db config failed.');
    return null;
  }

  const sql = 'select * from ' + dbconf.DBNAME_LINEBOT + '.' + dbconf.TBNAME_REPLY_MSG + ';';
  try {
    const result = await selectQuery(sql);
    if (Array.isArray(result) && result.length > 0) {
      const list = result as T_TABLE_REP_MSG[];
      return list;
    }
    return null;
  }
  catch (err) {
    applog.error(err);
    return null;
  }

}


export async function setDone(id: number, done: boolean): Promise<pjtype.T_STAT> {
  const dbconf = conf.getDbConfig();
  if (!dbconf) {
    applog.error('get db config failed.');
    throw CV.NG;
  }
  const sql = 'update ' + dbconf.DBNAME_LINEBOT + '.' + dbconf.TBNAME_INTERVAL_MSG +
              ' set done=' + (done ? '1' : '0') +
              ' where id=' + id + ';';
  return updateQuery(sql);
}


export async function init(): Promise<pjtype.T_STAT> {
  const dbconf = conf.getDbConfig();
  if (!dbconf) {
    applog.error('get db config failed.');
    throw CV.NG;
  }

  gConnection = await mysql.createConnection({
    host: dbconf.DB_HOSTNAME ? dbconf.DB_HOSTNAME : 'localhost',
    user: dbconf.DB_USER ? dbconf.DB_USER : 'user',
    password: dbconf.DB_PASSWD ? dbconf.DB_PASSWD : 'pass',
    database: dbconf.DBNAME_LINEBOT ? dbconf.DBNAME_LINEBOT : 'db',
  });

  return CV.OK;
}


export async function end(): Promise<pjtype.T_STAT> {
  if (!gConnection) {
    return CV.NG;
  }

  await gConnection.end();
  return CV.OK;
}

