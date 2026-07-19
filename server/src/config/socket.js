const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // في الإنتاج نحدد رابط الفرونت إند فقط للأمان
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    // انضمام المستخدم لغرفة المؤتمر الخاصة به لضمان الـ Multi-tenancy
    socket.on('join_conference', (conferenceId) => {
      socket.join(conferenceId);
      console.log(`👤 User joined conference room: ${conferenceId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔥 User disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };