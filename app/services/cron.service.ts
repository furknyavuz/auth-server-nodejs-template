import cron from 'node-cron';
import { PostgreSqlProvider } from '../providers/postgresql.provider';
import { TokenRepository } from '../repository/token.repository';

// debug logger
const debugLog = require('debug')('auth-server:' + __filename.slice(__dirname.length + 1));

export function configureCronJobs() {
 cron.schedule('0 0 1 1-12 *', async () => {
  console.log('running clean expired tokens cron job');
  const postgreSqlProvider = new PostgreSqlProvider();
  const tokenRepository = new TokenRepository(postgreSqlProvider);
  await tokenRepository.deleteExpiredTokens();
  debugLog('ended clean expired tokens cron job');
 }, {
  timezone: 'Etc/UTC'
 });

 cron.schedule('*/5 * * * *', async () => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory Usage: ${used.toFixed(2)} MB`);
 }, {
  timezone: 'Etc/UTC'
 });
}

