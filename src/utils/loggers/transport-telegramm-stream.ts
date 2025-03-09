import { Writable } from 'stream';
import { request } from 'https';
import { TelegramConfig } from '@/config';

export const telegramStream = new Writable({
  write(chunk, encoding, callback) {
    try {
      const msg = JSON.parse(chunk.toString());

      const date = new Date(msg.time);
      const formattedTime = date.toISOString().replace('T', ' ').split('.')[0];

      const formattedMsg = `[${msg.level.toUpperCase()}] ${formattedTime} - ${msg.msg}`;

      const data = JSON.stringify({
        chat_id: TelegramConfig.chatId,
        text: formattedMsg,
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TelegramConfig.token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => callback());
      });

      req.on('error', (err: Error) => {
        console.error('Error sending message to Telegram:', err);
        callback(err);
      });

      req.write(data);
      req.end();
    } catch (err) {
      console.error('Error in telegramStream method:', err);
    }
  },
});
