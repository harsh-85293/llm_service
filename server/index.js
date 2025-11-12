import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

async function start() {
  if (!MONGODB_URI) {
    console.warn('No MONGODB_URI provided. Set MONGODB_URI in environment to connect to MongoDB. Starting server without DB connection.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    return;
  }

  try {
    // Connect to MongoDB using mongoose
    await mongoose.connect(MONGODB_URI, {
      dbName: 'secureai',
    });

    console.log('Connected to MongoDB');

    // Register routes after DB connection so models use the connected mongoose instance
  const authRoutes = (await import('./routes/auth.js')).default;
  const usersRoutes = (await import('./routes/users.js')).default;
  const ticketsRoutes = (await import('./routes/tickets.js')).default;
  const llmRoutes = (await import('./routes/llm.js')).default;

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/llm', llmRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

start();
