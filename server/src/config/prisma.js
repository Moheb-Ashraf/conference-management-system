const { PrismaClient } = require('@prisma/client');

// إنشاء نسخة واحدة من Prisma Client لاستخدامها في كل المشروع
const prisma = new PrismaClient();

module.exports = prisma;