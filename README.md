# Logger Telegram

## Quickstart
1. Create `.env` file and fill with the "REQUIRED" variables from `.env.xmpl`
2. `npm i`
3. `npm run start`

## Overview  
This template provides a logging solution that streams messages to both the console and a Telegram bot.  
Telegram messages are sent with a 1-second delay ( [DELAY_FOR_CALL_MESSAGE_MS](src/config/constants.ts) ) to reduce spam.  
If the message queue exceeds 100 entries ( [TelegramConfig.maxMessagesQueue](src/config/telegram.config.ts) ), it is automatically cleared.

## Output

### Displaying identical messages

Each identical message will update the previous one by adding a quantity counter. 

`logger.error('Error application')` // triggered 7 times
```
❗[ERROR] 2025-04-06 09:43:12 - Error application
    7
```

### Output json format

`logger.warn('Multicall result: {"comet": "0xefdfba3e4a02862330573394ab7139b97f462e84", "asset": "0xb52406fe15fb3b5e61542f0f1cbe27621c8f2cae", "method": "collateralReserves"}');`

```
⚠️[WARN] 2025-04-06 09:58:11 - Multicall result: {
  "comet": "0xefdfba3e4a02862330573394ab7139b97f462e84",
  "asset": "0xb52406fe15fb3b5e61542f0f1cbe27621c8f2cae",
  "method": "collateralReserves"
}
```
