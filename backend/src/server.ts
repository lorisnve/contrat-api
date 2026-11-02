import 'dotenv/config';
import { createApp } from './app.js';

if (process.env.NODE_ENV === 'production' && !process.env.PLAYER_TOKEN) {
  throw new Error('PLAYER_TOKEN doit être configuré en production');
}

const port = Number(process.env.PORT || 3001);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT doit être un entier compris entre 1 et 65535');
}

createApp().listen(port, () => {
  console.log(`API classement disponible sur http://localhost:${port}/api/v1/leaderboard`);
});
