import app from './app';
import { env } from './config';

const start = async () => {
  try {
    const port = Number(env.port);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
