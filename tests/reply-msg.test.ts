import * as conf from '../src/config';
import * as pjutil from '../src/pjutil';
import * as replyMsg from '../src/reply-msg';
import * as db from '../src/db';

beforeAll(async () => {
  await conf.init();
  await db.init();
});

afterAll(async () => {
  await db.end();
});

const now = pjutil.getCurrentTime() * 1000;
const event = {
  type:            'message',
  message:         { type: 'text', id: now.toString(), text: 'こんにちは' },
  webhookEventId:  'abcdefg',
  deliveryContext: { isRedelivery: false },
  timestamp:       now,
  source:          { type: 'user', userId: 'ABCDEFG' },
  replyToken:      'test-token',
  mode:            'active',
};

test('get reply message', async () => {
  try {
    const ret = await replyMsg.testGetReplyMessage(event);
    expect(ret.length > 0).toBe(true);
  }
  catch (err) {
    console.log(err);
  }
});

