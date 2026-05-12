import express, { type Application } from 'express';
import fileRoutes from './routes/file.routes.js';

const app: Application = express();

app.use(express.json());

// Routes
app.use('/api/v1/files', fileRoutes);

export default app;