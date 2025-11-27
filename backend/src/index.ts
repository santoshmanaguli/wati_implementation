import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Please stop the process using port ${PORT} or change the PORT in .env`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

