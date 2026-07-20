const express = require('express');
const cors = require('cors');

// 1. استيراد جميع المسارات (Routes)
const authRoutes = require('./routes/authRoutes');
const conferenceRoutes = require('./routes/conferenceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const teamRoutes = require('./routes/teamRoutes');
const memberRoutes = require('./routes/memberRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

// استيراد معالج الأخطاء
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 2. إعداد الـ CORS بشكل احترافي للإنتاج (Production)
const corsOptions = {
  // السماح لجميع الروابط في مرحلة التطوير، وتحديد رابط الفرونت إند في مرحلة الإنتاج
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 3. التحويل التلقائي للبيانات لـ JSON (يجب أن يكون قبل المسارات)
app.use(express.json());

// 4. نقطة فحص حالة السيرفر (Health Check)
// تستخدمها منصات الرفع (Render/Vercel) للتأكد أن السيرفر يعمل
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 5. تعريف مسارات الـ API الأساسية
app.use('/api/auth', authRoutes);
app.use('/api/conferences', conferenceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// 6. التعامل مع الروابط غير الموجودة (404 Not Found)
// التعديل هنا: حذفنا '*' وتركناها كـ Middleware عام
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `المسار المطلوب غير موجود: ${req.originalUrl}`
  });
});

// 7. معالج الأخطاء العالمي
app.use(errorHandler);

module.exports = app;