import * as dotenv from 'dotenv';
dotenv.config();

const missEnvError = (envName: string) =>
  new Error(`Required ENV not found: ${envName}`);

const logLevelConsole = process.env.LOG_LEVEL_CONSOLE?.toLowerCase();
if (!logLevelConsole) throw missEnvError('LOG_LEVEL_CONSOLE');

const logLevelTelegram = process.env.LOG_LEVEL_TELEGRAM?.toLowerCase();
if (!logLevelTelegram) throw missEnvError('LOG_LEVEL_TELEGRAM');

export const LevelLogConfig = {
  logLevelConsole,
  logLevelTelegram,
};
