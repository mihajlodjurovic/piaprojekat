import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import router from './routes';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/sportsphere_hub')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount all routes under /api
app.use('/api', router);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'SportSphere Hub API', version: '1.0.0' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
