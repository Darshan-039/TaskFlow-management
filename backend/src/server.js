require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Connect to MongoDB
connectDB();


// Security Middleware
app.use(helmet());
app.use(cors({ origin: 'https://task-flow-management-delta.vercel.app', credentials: true }));


// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);



// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));


// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', version: 'v1' });
});


// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', taskRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});


// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
