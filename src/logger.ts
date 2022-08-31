import log4js from 'log4js';
import {logConf} from '../config/logconf';

log4js.configure(logConf);

const applog = log4js.getLogger('app');
const syslog = log4js.getLogger('system');
export {applog, syslog};
