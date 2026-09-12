import { assertTelegramConfig } from './config/env.js';
import { startServer } from './http/server.js';

assertTelegramConfig();
startServer();
