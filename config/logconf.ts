import log4js from 'log4js';

const logConf:log4js.Configuration = {
  appenders: {
    consoleLog: {
      type: 'console',
    },
    systemLog: {
      type: 'file',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy/MM/dd hh:mm:ss} %p %f{1} %m',
      },
      filename: __dirname + '/../log/system.log',
      maxLogSize: 5000000,  // 5MB
      buckup: 5,  // 5 generations
      compress: true,
    },
    appLog: {
      type: 'file',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy/MM/dd hh:mm:ss} %p %f{1} %m',
      },
      filename: __dirname + '/../log/app.log',
      maxLogSize: 5000000,
      backups: 5,
      compress: true,
    },
  },
  categories: {
    // There must be a 'default' in the category
    'default': {
      appenders: ['consoleLog'],
      level: 'ALL',
    },
    'system': {
      appenders: ['systemLog'],
      level: 'INFO',
      enableCallStack: true,
    },
    'app': {
      appenders: ['appLog'],
      level: 'INFO',
      enableCallStack: true,
    },
  },
};

export { logConf };
