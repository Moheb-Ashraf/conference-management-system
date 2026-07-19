const http = require('http');
const app = require('./app');
const prisma = require('./config/prisma');
const { initSocket } = require('./config/socket'); // استيراد السوكيت

const PORT = process.env.PORT || 5000;

// 1. إنشاء HTTP Server من تطبيق Express
const server = http.createServer(app);

// 2. تهيئة Socket.io
initSocket(server);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 3. تشغيل الـ Server بدلاً من app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Server and Socket.io running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();