import * as dotenv from 'dotenv';
dotenv.config();

const missEnvError = (envName: string) =>
  new Error(`Required ENV not found: ${envName}`);

const token = process.env.BOT_TOKEN;
if (!token) throw missEnvError('BOT_TOKEN');

const chatId = process.env.CHAT_ID;
if (!chatId) throw missEnvError('CHAT_ID');

export const TelegramConfig = {
  token,
  chatId,
  maxMessagesQueue: 100,
};
