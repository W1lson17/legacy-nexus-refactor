import express, { type Express } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.0.1' });
});

app.listen(PORT, () => {
  console.log(`[api] Server running on port ${PORT}`);
});

export default app;