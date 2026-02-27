import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './api/chat.js';
import { knowledgeRouter } from './api/knowledge.js';
import { organizationRouter } from './api/organization.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/v1/chat', chatRouter);
app.use('/v1/knowledge', knowledgeRouter);
app.use('/v1/organizations', organizationRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SupportKit Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
