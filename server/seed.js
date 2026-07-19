const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@church.com'; // يمكنك تغييره
  const adminPassword = 'admin123'; // يمكنك تغييره

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@church.com');
    console.log('🔑 Password: admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());