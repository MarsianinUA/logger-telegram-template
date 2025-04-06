import { logger } from '@/utils';

logger.info('Starting application');

for (let i = 0; i < 10; i++) {
  logger.warn(
    `Multicall result: {"comet": "0xefdfba3e4a02862330573394ab7139b97f462e84", "asset": "0xb52406fe15fb3b5e61542f0f1cbe27621c8f2cae", "method": "collateralReserves"}`,
  );
}

logger.error('Error application');
