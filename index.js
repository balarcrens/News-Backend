const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Register Models
require('./models/User');
require('./models/Category');
require('./models/Tag');
require('./models/Article');
require('./models/Comment');
require('./models/View');
require('./models/Subscription');

const app = express();

// Basic Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply to all routes
app.use('/api/', limiter);

// Stricter limiter for auth/comments
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts
  message: 'Too many attempts from this IP, please try again after an hour',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/comments', (req, res, next) => {
  if (req.method === 'POST') return authLimiter(req, res, next);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/', (req, res) => {
  res.send('News Platform API is running...');
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
