import http from 'node:http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [env.WEB_ORIGIN, env.MOBILE_ORIGIN],
    credentials: true,
  },
});

io.on('connection', socket => {
  socket.on('subscribe:prices', ({ symbols = [] }: { symbols: string[] }) => {
    socket.join(symbols.map(symbol => `price:${symbol}`));
    socket.emit('market:status', { status: 'OPEN', message: 'Paper feed connected' });
  });
});

async function bootstrap() {
  try {
    await connectDatabase();
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB unavailable; API started with database-backed routes limited');
    console.warn(error);
  }

  server.listen(env.PORT, () => {
    console.log(`TradeIQ API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(error => {
  console.error(error);
  process.exit(1);
});
