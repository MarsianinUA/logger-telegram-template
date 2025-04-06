import { Writable } from 'stream';
import { DELAY_FOR_CALL_MESSAGE_MS, TelegramConfig } from '@/config';
import { setTimeout } from 'node:timers/promises';
import { createHash } from 'crypto';
import { formatJsonInString } from './format-json-in-string';

const hostname = 'api.telegram.org';

let lastMessageHash = '';
let lastMessageId = '';
let repeatCounter = 0;

let messageQueue: { text: string; updateLast: boolean }[] = [];

let processingQueue = false;
let processingFatalAndClearQueue = false;

// Format log level with emoji
const levelEmojis: Record<string, string> = {
  error: '❗',
  fatal: '‼️',
  warn: '⚠️',
  info: '',
};

const getOptions = (isEdit = false) => ({
  hostname,
  path: isEdit
    ? `/bot${TelegramConfig.token}/editMessageText`
    : `/bot${TelegramConfig.token}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const sendMessageOrUpdate = async (text: string, updateLast = false) => {
  const data = JSON.stringify({
    chat_id: TelegramConfig.chatId,
    text,
    parse_mode: 'HTML',
    ...(updateLast && { message_id: lastMessageId }),
  });

  try {
    const url = `https://${hostname}${getOptions(updateLast).path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data).toString(),
      },
      body: data,
    });
    const result = await response.json();

    if (!updateLast) {
      lastMessageId = result.result.message_id;
    }
    return true;
  } catch (error) {
    console.error('Telegram request error:', error);
    return false;
  }
};

const processQueue = async () => {
  if (processingQueue) return;
  processingQueue = true;

  while (messageQueue.length > 0 && !processingFatalAndClearQueue) {
    const [{ text, updateLast }] = messageQueue;
    const success = await sendMessageOrUpdate(text, updateLast);
    if (success) {
      messageQueue.shift();
    }
    await setTimeout(DELAY_FOR_CALL_MESSAGE_MS);
  }

  processingQueue = false;
};

const sendFatalAndClearQueue = async () => {
  if (processingFatalAndClearQueue) return;
  processingFatalAndClearQueue = true;

  const fatalMessage = `‼️<b>[FATAL]</b> ${new Date().toISOString().replace('T', ' ').split('.')[0]} - Queue overflow: more than ${TelegramConfig.maxMessagesQueue} messages. Clearing queue.`;
  messageQueue = [{ text: fatalMessage, updateLast: false }];

  processingFatalAndClearQueue = false;
};

export const telegramStream = new Writable({
  write(chunk, encoding, callback) {
    try {
      const msg = JSON.parse(chunk.toString());
      const date = new Date(msg.time);
      const [formattedTime] = date.toISOString().replace('T', ' ').split('.');

      const emoji = levelEmojis[msg.level.toLowerCase()] || '';
      const formattedLevel = `<b>${msg.level.toUpperCase()}</b>`;

      let messageContent: string;

      try {
        messageContent = formatJsonInString(msg.msg);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        messageContent = msg.msg.toString();
      }

      const baseMessage = `${emoji}[${formattedLevel}] ${formattedTime} - ${messageContent}`;

      const currentHash = createHash('md5')
        .update(`${msg.level}${messageContent}`)
        .digest('hex');

      if (currentHash === lastMessageHash) {
        repeatCounter++;
        const updatedMessage = `${baseMessage}\n<b>x${repeatCounter}</b>`;
        if (messageQueue.length >= TelegramConfig.maxMessagesQueue) {
          sendFatalAndClearQueue();
        } else {
          messageQueue.push({ text: updatedMessage, updateLast: true });
          processQueue();
        }
      } else {
        repeatCounter = 1;
        lastMessageHash = currentHash;
        if (messageQueue.length >= TelegramConfig.maxMessagesQueue) {
          sendFatalAndClearQueue();
        } else {
          messageQueue.push({ text: baseMessage, updateLast: false });
          processQueue();
        }
      }

      callback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('Error in telegramStream');
    }
  },
});
