import * as db from './db';
import * as pjutil from './pjutil';
import * as linebot from './linebot';
import { ConstVal as CV } from './const';
import * as conf from './config';
import { pjtype } from '../types/type';
import { applog } from './logger';


///////////////////////////
// private function
///////////////////////////
async function getReplyMessage(event: any): Promise<string> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    applog.error('argument event is invalid.');
    return '';
  }

  const config = conf.getReplyMsgConfig();
  if (!config) {
    applog.error('get reply message config failed.');
    throw CV.NG;
  }

  let msg = config.NOT_FOUND_MSG;
  try {
    const list = await db.getReplyMessageList();
    if (!list) {
      applog.error('list is null');
      return '';
    }
    for (const row of list) {
      if (pjutil.includeObjKey(row, 'req')) {
        if (row.req === event.message.text) {
          applog.debug(`row.req=${row.req}`);
          msg = row.req;
        }
      }
    }
  }
  catch (err) {
    applog.error('get reply message failed.', err);
    return '';
  }

  return msg;
}

///////////////////////////
// public function
///////////////////////////
export async function pushReplyMessage(event: any): Promise<pjtype.T_STAT> {
  const msg = await getReplyMessage(event);
  if (!msg) {
    applog.error('message is empty.');
    CV.NG;
  }

  return linebot.replyMessage(event, msg);
}

export async function testGetReplyMessage(event: any): Promise<string> {
  return getReplyMessage(event);
}
