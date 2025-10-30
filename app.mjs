import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellinote';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route placeholders
app.get('/', (req, res) => {
  res.json({ message: 'IntelliNote API' });
});

// Course routes
app.get('/courses', (req, res) => {
  res.json({ message: 'Get all courses' });
});

app.post('/courses/create', (req, res) => {
  res.json({ message: 'Create course' });
});

// Lecture routes
app.post('/lectures/upload', (req, res) => {
  res.json({ message: 'Upload lecture' });
});

app.get('/lectures/:id', (req, res) => {
  res.json({ message: `Get lecture ${req.params.id}` });
});

app.get('/lectures/:id/study-pack', (req, res) => {
  res.json({ message: `Get study pack for lecture ${req.params.id}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
