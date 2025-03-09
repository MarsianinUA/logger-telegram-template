import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';
import { telegramStream } from './transport-telegramm-stream';
import { LevelLogConfig } from '@/config';

export const logger: Logger = pino(
  {
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
  },
  pino.multistream([
    {
      stream: pretty({
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      }),
      level: LevelLogConfig.logLevelConsole,
    },
    {
      stream: telegramStream,
      level: LevelLogConfig.logLevelTelegram,
    },
  ]),
);
