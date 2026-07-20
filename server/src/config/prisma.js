const { PrismaClient } = require('@prisma/client');

// في وضع التطوير، نحفظ الـ instance على الـ global object
// عشان لو nodemon عمل reload للملف، يستخدم نفس الـ instance القديم
// بدل ما يفتح اتصال جديد فوق القديم في كل مرة
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;