
import * as line from '@line/bot-sdk';
import express from 'express';
import http from 'http';
import * as reply from './reply-msg';
import { applog } from './logger';
import * as conf from './config';
import { ConstVal as CV } from './const';
import { pjtype } from '../types/type';


let gExpressServer: http.Server;
let gClient: line.Client;

///////////////////////////
// public function
///////////////////////////
export async function sendMessage(msg: string): Promise<pjtype.T_STAT> {
  const message: line.Message = {
    type: 'text',
    text: msg,
  };

  try {
    await gClient.broadcast(message);
    applog.debug('send bloadcast message success.');
  }
  catch (err) {
    applog.error('Failed.' + err);
    return CV.NG;
  }

  return CV.OK;
}

export async function replyMessage(event: any, msg: string): Promise<pjtype.T_STAT> {
  const res: line.Message = { type: 'text', text: msg };
  try {
    await gClient.replyMessage(event.replyToken, res);
    applog.debug('send reply message success.');
  }
  catch (err) {
    applog.error(err);
    return CV.NG;
  }

  return CV.OK;
}


export function init(): pjtype.T_STAT {
  const app = express();
  const lineConf = conf.getLineConfig();
  let port:any;

  if (!lineConf) {
    applog.error('get line config failed.');
    throw CV.NG;
  }

  let config;
  if (lineConf.TEST_MODE) {
    config = {
      channelSecret: lineConf.TEST_CHANNEL_SECRET,
      channelAccessToken: lineConf.TEST_CHANNEL_ACCESS_TOKEN,
    };
  }
  else {
    config = {
      channelSecret: lineConf.CHANNEL_SECRET,
      channelAccessToken: lineConf.CHANNEL_ACCESS_TOKEN,
    };
  }

  app.get(
      '/',
      async (req, res) => {
        applog.debug('GET req=' + req.body);
        await res.send('Hello, LINE BOT!(GET)' + 'test');
      },
  );

  app.post(
      '/webhook',
      line.middleware(config),
      async (req, res) => {
        applog.debug('POST req=' + req.body);
        /* LINE develop コンソール疎通確認用 */
        if (req.body.events[0] == null) {
          await res.send('Hello LINE BOT!(POST)');
          applog.error('疎通確認');
          return;
        }

        for (const event of req.body.events) {
          await reply.pushReplyMessage(event);
        }

        res.end();
      },
  );


  if (process.env.PORT) {
    port = process.env.PORT;
  }
  else {
    port = lineConf.DEFAULT_PORT;
  }

  gExpressServer = app.listen(port, () => {
    applog.info(`Server running at ${port}`);
  });

  gClient = new line.Client(config);
  if (!gClient) {
    applog.error('create line client failed.');
    return CV.NG;
  }

  return CV.OK;
}

export function end(): void {
  if (gExpressServer) {
    gExpressServer.close();
  }
}

